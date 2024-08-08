import crypto from 'crypto';
import { guard } from '@ucast/mongo2js';
import { ApiKey, BaseSchema, Roles as RolesSchema } from './schemas';
import mongoose from 'mongoose';
import { accessibleRecordsPlugin, AccessibleRecordModel } from '@casl/mongoose';
import {
  ActionType,
  BaseSubject,
  buildFilterFieldsMethod,
  CustomRole,
  NativeSubjectType,
  Permissions,
  PermissionsConfig,
  SubjectCollaborator,
  User,
  UserSubject,
  SubjectRelations,
} from '..';
import { validateRules } from './rulesBuilder';
import { buildSubjectRelations, getParentSubjectIds } from './utils';
import { InvalidAPIKey, ObjectNotFoundError, PrismeError } from './errors';

type Document<T = any> = mongoose.Document<any, any, T>;
interface DocumentMethods<T = any> {
  filterFields: (permissions: Permissions<any>) => T & BaseSubject;
  toJSON: () => T & BaseSubject;
}

type Model<DocumentT> = mongoose.Model<
  DocumentT,
  AccessibleRecordModel<DocumentT, {}, DocumentMethods>
>;

export interface AccessManagerOptions<SubjectType extends string = string> {
  appName?: string;
  storage: {
    driver?: 'mongoose';
    host: string;
    password?: string;
    driverOptions?: Record<string, any>;
  };
  schemas: Record<
    SubjectType,
    false | mongoose.Schema | Record<string, object>
  >;
  rbac?: {
    cacheCustomRoles?: boolean;
    enabledSubjectTypes?: SubjectType[];
  };
}

export interface FindOptions {
  pagination?: {
    page?: number;
    limit?: number;
  };
  sort?: string;
}

const DEFAULT_FIND_PAGE_SIZE = 20;

export type FilterQuery<
  SubjectInterface,
  Role extends string = string
> = mongoose.FilterQuery<Document<SubjectInterface>>;

export class AccessManager<
  SubjectType extends string,
  SubjectInterfaces extends { [k in SubjectType]: UserSubject },
  Role extends string = string
> {
  private mongoose?: mongoose.Mongoose;

  private opts: AccessManagerOptions<SubjectType>;
  private models: Record<SubjectType, Model<SubjectInterfaces[any]>>;
  private permissionsConfig: PermissionsConfig<SubjectType, Role>;
  private permissions?: Permissions<SubjectType>;
  public user?: User;
  private subjectRelations: SubjectRelations<SubjectType>;
  private alreadyPulledSubjectFieldRefs: Set<any>;
  private customRoles?: Record<string, CustomRole<SubjectType>[]>;

  constructor(
    opts: AccessManagerOptions<SubjectType>,
    permissionsConfig: PermissionsConfig<SubjectType, Role>
  ) {
    this.opts = opts;
    this.permissionsConfig = permissionsConfig;

    mongoose.plugin(accessibleRecordsPlugin);
    const schemas: Record<SubjectType, mongoose.Schema | false> =
      Object.entries({
        ...opts.schemas,
        [NativeSubjectType.Roles]: RolesSchema,
      }).reduce((schemas, [name, schemaDef]) => {
        if (<mongoose.Schema | false>schemaDef === false) {
          return { ...schemas, [name]: false };
        }
        const schema =
          schemaDef instanceof mongoose.Schema
            ? schemaDef
            : new mongoose.Schema(schemaDef as Record<string, object>);

        schema.add(BaseSchema);

        schema.method({ filterFields: buildFilterFieldsMethod(name as any) });

        return {
          ...schemas,
          [name]: schema,
        };
      }, {} as Record<SubjectType, mongoose.Schema>);

    validateRules(
      (permissionsConfig.abac || []).concat(
        (permissionsConfig.rbac || []).flatMap((cur) => cur.rules)
      ),
      schemas
    );

    this.models = Object.entries(schemas).reduce<
      Record<SubjectType, Model<SubjectInterfaces[SubjectType]>>
    >((models, [name, schema]) => {
      if (schema === false) {
        return models;
      }
      return {
        ...models,
        [name]: mongoose.model(name, schema as mongoose.Schema),
      };
    }, {} as Record<SubjectType, Model<SubjectInterfaces[SubjectType]>>);

    this.alreadyPulledSubjectFieldRefs = new Set();
    this.subjectRelations = buildSubjectRelations(permissionsConfig);
    this.customRoles = opts?.rbac?.cacheCustomRoles ? {} : undefined;
  }

  async start() {
    const appName = this.opts.appName || '@prismeai/permissions';
    this.mongoose = await mongoose.connect(this.opts.storage.host, {
      appName,
      socketTimeoutMS: 60 * 1000, // Close sockets after 60 secs of inactivity
      maxPoolSize: 30,
      ...this.opts.storage.driverOptions,
    });
  }

  async close() {
    if (this.mongoose) {
      await this.mongoose.connection.close();
    }
  }

  async as(
    user: User,
    apiKey?: string
  ): Promise<Required<AccessManager<SubjectType, SubjectInterfaces, Role>>> {
    const child: Required<AccessManager<SubjectType, SubjectInterfaces, Role>> =
      Object.assign({}, this, {
        permissions: new Permissions(user, this.permissionsConfig),
        user: {
          ...user,
          role: user.role,
        },
        alreadyPulledSubjectFieldRefs: new Set(),
      });
    Object.setPrototypeOf(child, AccessManager.prototype);

    if (apiKey) {
      try {
        await child.pullApiKey(apiKey);
      } catch {}
    }
    return child;
  }

  async updatePermissions(user: User) {
    this.permissions?.updateUserRules(user);
  }

  async pullRoleFromSubject<returnType extends SubjectType>(
    subjectType: returnType,
    subjectOrId: string | SubjectInterfaces[returnType]
  ): Promise<void> {
    const { permissions } = this.checkAsUser();
    const subject =
      typeof subjectOrId === 'string'
        ? (await this.__unsecureGet(subjectType, subjectOrId))?.toJSON()
        : subjectOrId;
    if (!subject) {
      return;
    }

    // Pull all custom roles defined for this subject type
    await this.pullRole(
      {
        subjectType,
        subjectId: subject.id,
        type: ['casl', 'role'],
      },
      {
        cache: true,
      }
    );

    // If we are given an id, only look permissions field in fetched object
    if (typeof subjectOrId === 'string') {
      return permissions.pullRoleFromSubject(subjectType, subject);
    }

    // If we are given a full object, check for parent objects & fetch their permissions
    await Promise.all(
      getParentSubjectIds(this.subjectRelations, subjectType, subject).map(
        async ({
          subjectType: parentSubjectType,
          subjectId: parentSubjectId,
        }) => {
          if (this.alreadyPulledSubjectFieldRefs.has(parentSubjectId)) {
            return Promise.resolve(true);
          }
          this.alreadyPulledSubjectFieldRefs.add(parentSubjectId);
          return await this.pullRoleFromSubject(
            parentSubjectType,
            parentSubjectId
          );
        }
      )
    );
  }

  public async __unsecureGet<returnType extends SubjectType>(
    subjectType: returnType,
    id: string | FilterQuery<SubjectInterfaces[returnType], Role>
  ) {
    if (!id) {
      return null;
    }
    const Model = this.model(subjectType);
    const query = typeof id === 'string' ? { id } : id;
    const subject = await Model.findOne(query);
    return subject;
  }

  public async __unsecureFind<returnType extends SubjectType>(
    subjectType: returnType,
    query: mongoose.FilterQuery<Document<SubjectInterfaces[returnType]>>,
    opts?: FindOptions
  ) {
    const { page = 0, limit = DEFAULT_FIND_PAGE_SIZE } = opts?.pagination || {};

    const Model = this.model(subjectType);
    const subject = await Model.find(query)
      .sort(opts?.sort!)
      .skip(page * limit)
      .limit(limit);
    return subject;
  }

  public model<returnType extends SubjectType>(
    subjectType: returnType
  ): Model<SubjectInterfaces[returnType]> {
    if (!(subjectType in this.models)) {
      throw new Error(
        `Unknown model ${subjectType}. Did you provide a persistance schema for this subjectType ?`
      );
    }
    return this.models[subjectType];
  }

  private checkAsUser() {
    const { permissions, user } = this;
    if (!permissions || !user) {
      throw new Error(
        'You must call AccessManager.as(user) method before anything else.'
      );
    }
    return { permissions, user };
  }

  async findAll<returnType extends SubjectType>(
    subjectType: returnType,
    additionalQuery?: mongoose.FilterQuery<
      Document<SubjectInterfaces[returnType]>
    >,
    opts?: FindOptions
  ): Promise<(SubjectInterfaces[returnType] & BaseSubject)[]> {
    if (additionalQuery) {
      await this.pullRoleFromSubject(subjectType, <any>additionalQuery);
    }
    const { permissions } = this.checkAsUser();
    const SubjectModel = this.model(subjectType);
    const mongoQuery = (
      SubjectModel as any as AccessibleRecordModel<any>
    ).accessibleBy(permissions.ability, ActionType.Read);

    const { page = 0, limit = DEFAULT_FIND_PAGE_SIZE } = opts?.pagination || {};
    const accessibleSubjects = await SubjectModel.find({
      ...additionalQuery,
      ...mongoQuery.getQuery(),
    })
      .sort(opts?.sort!)
      .skip(page * limit)
      .limit(limit);

    return accessibleSubjects
      .filter((cur) =>
        permissions.can(ActionType.Read, subjectType, cur.toJSON())
      )
      .map((cur) => cur.filterFields(permissions));
  }

  async get<returnType extends SubjectType>(
    subjectType: returnType,
    query: string | FilterQuery<SubjectInterfaces[returnType], Role>
  ): Promise<SubjectInterfaces[returnType] & BaseSubject> {
    const { permissions } = this.checkAsUser();
    const subject = await this.__unsecureGet(subjectType, query);
    if (!subject) {
      throw new ObjectNotFoundError('Object not found', {
        subjectType,
        query,
      });
    }

    await this.throwUnlessCan(ActionType.Read, subjectType, subject.toJSON());
    return subject.filterFields(permissions);
  }

  private filterFieldsBeforeUpdate<T>(document: T | Document<T>): T {
    const object: T =
      typeof (<Document>document).toJSON === 'function'
        ? ((<Document>document).toJSON() as T)
        : ({ ...document } as T);

    delete (<any>object).createdAt;
    delete (<any>object).createdBy;
    delete (<any>object).updatedAt;
    delete (<any>object).updatedBy;
    delete (<any>object).id;
    delete (<any>object)._id;
    delete (<any>object).permissions;
    return object;
  }

  async create<returnType extends SubjectType>(
    subjectType: returnType,
    subject: Omit<SubjectInterfaces[returnType], 'id'> & { id?: string },
    opts?: {
      publicRead?: boolean;
    }
  ): Promise<SubjectInterfaces[returnType] & BaseSubject> {
    const { permissions, user } = this.checkAsUser();
    await this.throwUnlessCan(ActionType.Create, subjectType, <any>subject!!);
    const Model = this.model(subjectType);
    const date = new Date();
    const autoAssignRole =
      this.permissionsConfig.subjects[subjectType]?.author?.assignRole;

    const basePermissions = opts?.publicRead
      ? {
          '*': {
            policies: {
              read: true,
            },
          },
        }
      : {};
    const object = new Model({
      ...this.filterFieldsBeforeUpdate(subject),
      createdBy: user.id,
      updatedBy: user.id,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      permissions: autoAssignRole
        ? {
            ...basePermissions,
            [user.id]: {
              role: autoAssignRole,
            },
          }
        : basePermissions,
    });
    object.id = subject.id || object._id!!.toString();
    await object.save();
    permissions.pullRoleFromSubject(subjectType, object.toJSON());
    return (object as any).filterFields(permissions);
  }

  async update<returnType extends SubjectType>(
    subjectType: returnType,
    updatedSubject: Partial<SubjectInterfaces[returnType]> & { id: string },
    opts?: {
      publicRead?: boolean;
    }
  ): Promise<SubjectInterfaces[returnType] & BaseSubject> {
    const { permissions, user } = this.checkAsUser();

    const currentSubject = await this.__unsecureGet(
      subjectType,
      updatedSubject.id
    );
    if (!currentSubject) {
      throw new ObjectNotFoundError('Object not found', {
        subjectType,
        query: {
          id: updatedSubject.id,
        },
      });
    }

    await this.throwUnlessCan(
      ActionType.Update,
      subjectType,
      currentSubject.toJSON()
    );

    const date = new Date();
    currentSubject.set({
      ...this.filterFieldsBeforeUpdate(updatedSubject),
      updatedAt: date.toISOString(),
      updatedBy: user.id,
    });
    if (typeof opts?.publicRead === 'boolean') {
      currentSubject.set({
        permissions: {
          ...currentSubject.toJSON().permissions,
          '*': opts?.publicRead ? { policies: { read: true } } : {},
        },
      });
    }

    await currentSubject.save();
    return currentSubject.filterFields(permissions);
  }

  async delete<returnType extends SubjectType>(
    subjectType: returnType,
    id: string
  ): Promise<void> {
    const subject = await this.__unsecureGet(subjectType, id);
    if (!subject) {
      throw new ObjectNotFoundError('Object not found', {
        subjectType,
        query: {
          id,
        },
      });
    }

    await this.throwUnlessCan(ActionType.Delete, subjectType, subject.toJSON());
    await subject.deleteOne();
  }

  async deleteMany<returnType extends SubjectType>(
    subjectType: returnType,
    query: FilterQuery<SubjectInterfaces[returnType], Role>
  ): Promise<SubjectInterfaces[returnType][]> {
    const subjects = await this.findAll(subjectType, query);

    const toRemove = await this.filterSubjectsBy(
      ActionType.Delete,
      subjectType,
      subjects
    );

    const Model = this.model(subjectType);
    await Model.deleteMany({
      id: {
        $in: toRemove.map((subject) => subject.id),
      },
    });

    return toRemove;
  }

  async grant<returnType extends SubjectType>(
    subjectType: returnType,
    id: string,
    user: Prismeai.UserPermissionsTarget,
    permission: ActionType | ActionType[] | Role | SubjectCollaborator
  ): Promise<SubjectInterfaces[returnType] & BaseSubject> {
    const { permissions } = this.checkAsUser();

    const doc = await this.__unsecureGet(subjectType, id);
    if (!doc) {
      throw new ObjectNotFoundError('Object not found', {
        subjectType,
        query: {
          id,
        },
      });
    }

    await this.throwUnlessCan(
      ActionType.ManagePermissions,
      subjectType,
      doc.toJSON()
    );

    if (user.role && (permission as SubjectCollaborator)?.role) {
      throw new PrismeError(
        'Cant bind a role to another role. Only policies are supported'
      );
    }
    await this.pullRole(
      {
        subjectType,
        subjectId: id,
      },
      {
        cache: true,
      }
    );
    const updatedSubject = permissions.grant(
      permission,
      subjectType,
      doc.toJSON(),
      user
    );

    doc.set(updatedSubject);
    await doc.save();
    return doc.filterFields(permissions);
  }

  async revoke<returnType extends SubjectType>(
    subjectType: returnType,
    id: string,
    permId: string
  ): Promise<SubjectInterfaces[returnType] & BaseSubject> {
    const { permissions } = this.checkAsUser();

    const doc = await this.__unsecureGet(subjectType, id);
    if (!doc) {
      throw new ObjectNotFoundError('Object not found', {
        subjectType,
        query: {
          id,
        },
      });
    }

    await this.throwUnlessCan(
      ActionType.ManagePermissions,
      subjectType,
      doc.toJSON()
    );
    const updatedSubject = permissions.revoke(
      'all',
      subjectType,
      doc.toJSON(),
      permId
    );

    doc.set(updatedSubject);
    await doc.save();
    return doc.filterFields(permissions);
  }

  async can<returnType extends SubjectType>(
    actionType: ActionType | string,
    subjectType: returnType,
    subject: SubjectInterfaces[returnType],
    opts?: { disableRolePull?: boolean }
  ): Promise<boolean> {
    const { permissions } = this.checkAsUser();
    if (!opts?.disableRolePull) {
      await this.pullRoleFromSubject(
        subjectType,
        typeof subject.toJSON === 'function' ? subject.toJSON() : subject
      );
    }
    return permissions.can(actionType, subjectType, subject);
  }

  async throwUnlessCan<returnType extends SubjectType>(
    actionType: ActionType | string,
    subjectType: SubjectType,
    idOrSubject: SubjectInterfaces[returnType] | string,
    includeErrorSubject?: boolean
  ) {
    const { permissions } = this.checkAsUser();

    const subject =
      typeof idOrSubject === 'string'
        ? await this.__unsecureGet(subjectType, idOrSubject)
        : idOrSubject;
    if (!subject) {
      throw new ObjectNotFoundError('Object not found', {
        subjectType,
        query: {
          id: idOrSubject,
        },
      });
    }

    const modelSubject = subject as Document<SubjectInterfaces[returnType]>;
    const subjectJson =
      typeof modelSubject.toJSON === 'function'
        ? modelSubject.toJSON()
        : subject;
    await this.pullRoleFromSubject(subjectType, subjectJson as any); // TODO fix ts
    permissions.throwUnlessCan(
      actionType,
      subjectType,
      subjectJson,
      includeErrorSubject
    );

    return true;
  }

  async filterSubjectsBy<returnType extends SubjectType>(
    actionType: ActionType | string,
    subjectType: returnType,
    subjects: SubjectInterfaces[returnType][]
  ): Promise<SubjectInterfaces[returnType][]> {
    await this.pullRoleFromSubject(subjectType, subjects[0]);
    const filtered = await Promise.all(
      subjects.map(async (cur) => {
        const accessible = await this.can(actionType, subjectType, cur);
        return accessible ? cur : false;
      })
    );
    return filtered.filter(Boolean) as SubjectInterfaces[returnType][];
  }

  async pullRole(
    query: mongoose.FilterQuery<Document<CustomRole<SubjectType>>>,
    opts?: { loadRules?: boolean; cache?: boolean; cacheKey?: string }
  ) {
    if (
      query.subjectType &&
      (!this.opts?.rbac?.enabledSubjectTypes ||
        !this.opts.rbac.enabledSubjectTypes.includes(query.subjectType))
    ) {
      return [];
    }
    const { permissions } = this.checkAsUser();

    const cacheKey =
      opts?.cacheKey ||
      Object.entries(query)
        .filter(([k, v]) => k !== 'type')
        .map(([k, v]) => `${k}:${v}`)
        .sort()
        .join(',');
    let roles =
      opts?.cache && this.customRoles ? this.customRoles[cacheKey] : undefined;
    if (!roles) {
      roles = (await this.findRoles(query, true)).filter(
        (cur) => !cur.disabled
      );
      if (this.customRoles && (opts?.cache || cacheKey in this.customRoles)) {
        this.customRoles[cacheKey] = roles;
      }
    }

    if (!roles?.length) {
      return [];
    }

    // Set current user role if there is any role automatically matching current user authData
    if (this.user && !this.user.role) {
      const loadedRoles = await this.loadRolesFromAuthData(
        permissions,
        roles,
        this.user
      );
      if (query.subjectType && query.subjectId && loadedRoles[0]) {
        permissions.saveSubjectRole(
          query.subjectType,
          query.subjectId,
          loadedRoles[0]
        );
      }
    }

    // loadRules make generated rules immediately effective (i.e apiKey, forced role sent within a request, or custom role binded to some authData),
    // while loadRoles make these rules available in case we load an object with one of these role names assigned
    if (opts?.loadRules) {
      permissions.loadRules(roles.flatMap((role) => role.rules));
    } else {
      permissions.loadRoles(roles);
    }

    return roles;
  }

  async loadRolesFromAuthData(
    permissions: Permissions<SubjectType>,
    roles: CustomRole<SubjectType>[],
    user: User
  ) {
    if (!Object.keys(user?.authData || {}).length) {
      return [];
    }
    const matchingRoles = roles.filter((role) => {
      const commonProviders = Object.entries(role.auth || {}).filter(
        ([authProvider, config]) => {
          if (authProvider == 'apiKey') {
            return false;
          }
          if (!(authProvider in user.authData!)) {
            return false;
          }
          // Handle conditions
          const conditions = (<any>config)?.conditions || {};
          if (!Object.keys(conditions).length) {
            return true;
          }
          return guard(conditions)({
            authData: user.authData?.[authProvider] || {},
          });
        }
      );
      if (!commonProviders?.length) {
        return false;
      }
      return true;
    });

    permissions.loadRules(matchingRoles.flatMap((role) => role.rules));
    return matchingRoles.map((cur) => cur.name);
  }

  async saveRole(
    role: CustomRole<SubjectType>
  ): Promise<CustomRole<SubjectType>> {
    if (!role.id) {
      throw new PrismeError('A role id is required for saving');
    }
    if (
      !this.opts?.rbac?.enabledSubjectTypes ||
      !this.opts.rbac.enabledSubjectTypes.includes(role.subjectType)
    ) {
      throw new PrismeError(
        `Custom roles are not enabled for subjectType '${role.subjectType}'`
      );
    }

    await this.throwUnlessCan(
      ActionType.ManagePermissions,
      role.subjectType,
      role.subjectId
    );

    const RolesModel = await this.model(<any>NativeSubjectType.Roles); //as any as AccessibleRecordModel<Document<CustomRole<SubjectType>>>;

    // Validate role
    if (typeof role.rules === 'object') {
      (<any>role).rules = JSON.stringify(role.rules);
    }
    (<any>role).casl = null;

    // Generate api keys
    if (role.type === 'apiKey' && !role?.auth?.apiKey?.value) {
      role.auth = {
        ...role.auth,
        apiKey: {
          ...role.auth?.apiKey,
          value: crypto.randomUUID(),
        },
      };
    }

    // Stringify auth conditions
    if (role.auth) {
      role.auth = Object.entries(role.auth || {}).reduce(
        (obj, [provider, config]) => ({
          ...obj,
          [provider]: {
            ...config,
            conditions: (<any>config).conditions
              ? JSON.stringify((<any>config).conditions)
              : undefined,
          },
        }),
        {}
      );
    }

    const savedRole = await RolesModel.findOneAndUpdate(
      {
        id: role.id,
      },
      role,
      {
        new: true,
        upsert: true,
      }
    );

    return savedRole.toJSON();
  }

  async deleteRole(id: string): Promise<boolean> {
    const RolesModel = await this.model(<any>NativeSubjectType.Roles);

    // Check that authenticated user has the expected permissions
    const doc = await RolesModel.findOne({ id });

    if (!doc) {
      throw new ObjectNotFoundError();
    }
    const role = doc.toJSON();
    await this.throwUnlessCan(
      ActionType.ManagePermissions,
      role.subjectType,
      role.subjectId
    );

    await RolesModel.deleteOne({ id });
    return true;
  }

  async findRoles(
    query: mongoose.FilterQuery<Document<CustomRole<SubjectType>>>,
    asSuperAdmin?: boolean
  ): Promise<CustomRole<SubjectType>[]> {
    if (!asSuperAdmin) {
      await this.throwUnlessCan(
        ActionType.ManagePermissions,
        query.subjectType,
        query.subjectId
      );
    }

    const RolesModel = await this.model(<any>NativeSubjectType.Roles);

    const docs = await RolesModel.find(query);
    const roles = docs
      .map((role) => role.toJSON())
      .map((role) => {
        try {
          // Keep role.casl retro compatibility, but role.rules should now be stringified CASL
          if (typeof (<any>role).casl === 'string') {
            role.rules = JSON.parse((<any>role).casl);
          } else if (typeof role.rules === 'string') {
            role.rules = JSON.parse(role.rules);
          } else {
            role.rules = (<any>role).casl || role.rules;
          }

          if (role.auth) {
            role.auth = Object.entries(role.auth || {}).reduce(
              (obj, [provider, config]) => ({
                ...obj,
                [provider]: {
                  ...(config as any),
                  conditions: (<any>config).conditions
                    ? JSON.parse((<any>config).conditions)
                    : undefined,
                },
              }),
              {}
            );
          }
        } catch (err) {
          console.error({
            msg: `Could not parse role ${role.id} from ${role.subjectType} ${role.subjectId}`,
            err,
          });
          role.rules = [];
        }

        delete (<any>role).casl;
        return role;
      });
    return roles;
  }

  async pullApiKey(apiKey: string) {
    try {
      const roles = await this.pullRole(
        { 'auth.apiKey.value': apiKey, type: 'apiKey' },
        { loadRules: true }
      );
      if (!roles.length) {
        throw new InvalidAPIKey();
      }
      return roles;
    } catch (error) {
      throw new InvalidAPIKey();
    }
  }

  async findApiKeys(
    subjectType: SubjectType,
    subjectId: string
  ): Promise<ApiKey<SubjectType>[]> {
    const roles = await this.findRoles({
      subjectType,
      subjectId,
      type: 'apiKey',
    });
    return roles
      .filter((role) =>
        role.id.startsWith(this.getApiKeyRoleId('', subjectType, subjectId))
      )
      .map((role) => this.convertRoleToApiKey(role));
  }

  private getApiKeyRoleId(
    apiKey: string,
    subjectType: SubjectType,
    subjectId: string
  ) {
    return `${subjectType}/${subjectId}/apiKey/${apiKey}`;
  }

  private convertRoleToApiKey(
    role: CustomRole<SubjectType>
  ): ApiKey<SubjectType> {
    let { name, rules, disabled, subjectId, subjectType, auth } = role;
    if (typeof rules === 'string') {
      rules = JSON.parse(rules);
    }

    return {
      apiKey: auth?.apiKey?.value!,
      name,
      rules,
      disabled,
      subjectId,
      subjectType,
    };
  }

  async createApiKey(
    subjectType: SubjectType,
    subjectId: string,
    { name, rules }: PrismeaiAPI.CreateApiKey.RequestBody
  ): Promise<ApiKey<SubjectType>> {
    const apiKey = crypto.randomUUID();
    const role = await this.saveRole({
      id: this.getApiKeyRoleId(apiKey, subjectType, subjectId),
      name,
      type: 'apiKey',
      subjectType,
      subjectId,
      rules,
      auth: {
        apiKey: {
          value: apiKey,
        },
      },
    });
    return this.convertRoleToApiKey(role);
  }

  async updateApiKey(
    apiKey: string,
    subjectType: SubjectType,
    subjectId: string,
    { name, rules }: PrismeaiAPI.CreateApiKey.RequestBody
  ): Promise<ApiKey<SubjectType>> {
    const role = await this.saveRole({
      id: this.getApiKeyRoleId(apiKey, subjectType, subjectId),
      name,
      type: 'apiKey',
      subjectType,
      subjectId,
      rules,
      auth: {
        apiKey: {
          value: apiKey,
        },
      },
    });
    return this.convertRoleToApiKey(role);
  }

  async deleteApiKey(
    apiKey: string,
    subjectType: SubjectType,
    subjectId: string
  ): Promise<boolean> {
    return await this.deleteRole(
      this.getApiKeyRoleId(apiKey, subjectType, subjectId)
    );
  }

  public getLoadedSubjectRole(subjectType: SubjectType, subjectId: string) {
    const { permissions } = this.checkAsUser();
    return permissions.getLoadedSubjectRole(subjectType, subjectId);
  }
}
