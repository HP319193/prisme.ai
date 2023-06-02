import crypto from 'crypto';
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
  Rules,
} from '..';
import { validateRules } from './rulesBuilder';
import { buildSubjectRelations, getParentSubjectIds } from './utils';
import { InvalidAPIKey, ObjectNotFoundError, PrismeError } from './errors';

type Document<T = any> = Omit<mongoose.Document<T>, 'toJSON'> &
  BaseSubject & {
    filterFields: (permissions: Permissions<any>) => T & BaseSubject;
    toJSON: () => T & BaseSubject;
  };

export interface AccessManagerOptions<SubjectType extends string = string> {
  storage: {
    driver?: 'mongoose';
    host: string;
    password?: string;
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
  private opts: AccessManagerOptions<SubjectType>;
  private models: Record<SubjectType, AccessibleRecordModel<Document>>;
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

        (schema as mongoose.Schema).plugin(accessibleRecordsPlugin);
        (schema as mongoose.Schema).add(BaseSchema);

        (schema as mongoose.Schema).method(
          'filterFields',
          buildFilterFieldsMethod(name as any)
        );

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

    this.models = Object.entries(schemas).reduce((models, [name, schema]) => {
      if (schema === false) {
        return models;
      }
      return {
        ...models,
        [name]: mongoose.model(name, schema as mongoose.Schema),
      };
    }, {} as Record<SubjectType, AccessibleRecordModel<Document>>);

    this.alreadyPulledSubjectFieldRefs = new Set();
    this.subjectRelations = buildSubjectRelations(permissionsConfig);
    this.customRoles = opts?.rbac?.cacheCustomRoles ? {} : undefined;
  }

  async start() {
    await mongoose.connect(this.opts.storage.host);
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
          role: user.role || 'guest',
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
        ? (await this.fetch(subjectType, subjectOrId))?.toJSON()
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

  private async fetch<returnType extends SubjectType>(
    subjectType: returnType,
    id: string | FilterQuery<SubjectInterfaces[returnType], Role>
  ): Promise<Document<SubjectInterfaces[returnType]> | null> {
    if (!id) {
      return null;
    }
    const Model = this.model(subjectType);
    const query = typeof id === 'string' ? { id } : id;
    const subject = await Model.findOne(query);
    return subject;
  }

  public model<returnType extends SubjectType>(
    subjectType: returnType
  ): AccessibleRecordModel<Document<SubjectInterfaces[returnType]>> {
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
    const Model = this.model(subjectType);
    const mongoQuery = Model.accessibleBy(permissions.ability, ActionType.Read);

    const { page = 0, limit = DEFAULT_FIND_PAGE_SIZE } = opts?.pagination || {};
    const accessibleSubjects = await Model.find({
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
    const subject = await this.fetch(subjectType, query);
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
    subject: Omit<SubjectInterfaces[returnType], 'id'> & { id?: string }
  ): Promise<SubjectInterfaces[returnType] & BaseSubject> {
    const { permissions, user } = this.checkAsUser();
    await this.throwUnlessCan(ActionType.Create, subjectType, <any>subject!!);
    const Model = this.model(subjectType);
    const date = new Date();
    const autoAssignRole =
      this.permissionsConfig.subjects[subjectType]?.author?.assignRole;
    const object = new Model({
      ...this.filterFieldsBeforeUpdate(subject),
      createdBy: user.id,
      updatedBy: user.id,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      permissions: autoAssignRole
        ? {
            [user.id]: {
              role: autoAssignRole,
            },
          }
        : {},
    });
    object.id = subject.id || object._id!!.toString();
    await object.save();
    permissions.pullRoleFromSubject(subjectType, object.toJSON());
    return object.filterFields(permissions);
  }

  async update<returnType extends SubjectType>(
    subjectType: returnType,
    updatedSubject: Partial<SubjectInterfaces[returnType]> & { id: string }
  ): Promise<SubjectInterfaces[returnType] & BaseSubject> {
    const { permissions, user } = this.checkAsUser();

    const currentSubject = await this.fetch(subjectType, updatedSubject.id);
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
    await currentSubject.save();

    return currentSubject.filterFields(permissions);
  }

  async delete<returnType extends SubjectType>(
    subjectType: returnType,
    id: string
  ): Promise<void> {
    const subject = await this.fetch(subjectType, id);
    if (!subject) {
      throw new ObjectNotFoundError('Object not found', {
        subjectType,
        query: {
          id,
        },
      });
    }

    await this.throwUnlessCan(ActionType.Delete, subjectType, subject.toJSON());
    await subject.delete();
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

    const doc = await this.fetch(subjectType, id);
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

    const doc = await this.fetch(subjectType, id);
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
    subject: SubjectInterfaces[returnType]
  ): Promise<boolean> {
    const { permissions } = this.checkAsUser();
    await this.pullRoleFromSubject(
      subjectType,
      typeof subject.toJSON === 'function' ? subject.toJSON() : subject
    );
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
        ? await this.fetch(subjectType, idOrSubject)
        : idOrSubject;
    if (!subject) {
      throw new ObjectNotFoundError('Object not found', {
        subjectType,
        query: {
          id: idOrSubject,
        },
      });
    }

    await this.pullRoleFromSubject(
      subjectType,
      typeof subject.toJSON === 'function' ? subject.toJSON() : subject
    );
    permissions.throwUnlessCan(
      actionType,
      subjectType,
      typeof subject.toJSON === 'function' ? subject.toJSON() : subject,
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
    opts?: { loadRules?: boolean; cache?: boolean }
  ) {
    if (
      query.subjectType &&
      (!this.opts?.rbac?.enabledSubjectTypes ||
        !this.opts.rbac.enabledSubjectTypes.includes(query.subjectType))
    ) {
      return [];
    }
    const { permissions } = this.checkAsUser();

    const cacheKey = Object.entries(query)
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

    // loadRules make generated rules immediately effective (i.e apiKey or forced role sent within a request),
    // while loadRoles make these rules available in case we load an object with one of these role names assigned
    if (opts?.loadRules) {
      permissions.loadRules(roles.flatMap((role) => role.rules));
    } else {
      permissions.loadRoles(roles);
    }

    return roles;
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

    const RolesModel = (await this.model(
      <any>NativeSubjectType.Roles
    )) as any as AccessibleRecordModel<Document<CustomRole<SubjectType>>>;

    // Validate role
    if (typeof role.rules === 'object') {
      (<any>role).rules = JSON.stringify(role.rules);
    }
    (<any>role).casl = null;

    const savedApiKey = await RolesModel.findOneAndUpdate(
      {
        id: role.id,
      },
      role,
      {
        new: true,
        upsert: true,
      }
    );

    return savedApiKey.toJSON();
  }

  async deleteRole(id: string): Promise<boolean> {
    const RolesModel = (await this.model(
      <any>NativeSubjectType.Roles
    )) as any as AccessibleRecordModel<Document<CustomRole<SubjectType>>>;

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

    const RolesModel = (await this.model(
      <any>NativeSubjectType.Roles
    )) as any as AccessibleRecordModel<Document<CustomRole<SubjectType>>>;

    const docs = await RolesModel.find(query);
    const roles = docs
      .map((role) => role.toJSON())
      .map((role) => {
        // Keep role.casl retro compatibility, but role.rules should now be stringified CASL
        if (typeof (<any>role).casl === 'string') {
          role.rules = JSON.parse((<any>role).casl);
        } else if (typeof role.rules === 'string') {
          role.rules = JSON.parse(role.rules);
        } else {
          role.rules = (<any>role).casl || role.rules;
        }
        delete (<any>role).casl;
        return role;
      });
    return roles;
  }

  async pullApiKey(apiKey: string) {
    try {
      const roles = await this.pullRole(
        { name: apiKey, type: 'apiKey' },
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
    const roles = await this.findRoles({ subjectType, subjectId });
    return roles
      .filter((cur) => cur.type === 'apiKey')
      .map((role) => this.convertRoleToApiKey(role));
  }

  private getApiKeyRoleId(
    apiKey: string,
    subjectType: SubjectType,
    subjectId: string
  ) {
    return `apiKey/${apiKey}/${subjectType}/${subjectId}/`;
  }

  private convertRoleToApiKey(
    role: CustomRole<SubjectType>
  ): ApiKey<SubjectType> {
    let { name, rules, disabled, subjectId, subjectType } = role;
    if (typeof rules === 'string') {
      rules = JSON.parse(rules);
    }

    return { apiKey: name, rules, disabled, subjectId, subjectType };
  }

  async createApiKey(
    subjectType: SubjectType,
    subjectId: string,
    rules: Rules
  ): Promise<ApiKey<SubjectType>> {
    const apiKey = crypto.randomUUID();
    const role = await this.saveRole({
      id: this.getApiKeyRoleId(apiKey, subjectType, subjectId),
      name: apiKey,
      type: 'apiKey',
      subjectType,
      subjectId,
      rules,
    });
    return this.convertRoleToApiKey(role);
  }

  async updateApiKey(
    apiKey: string,
    subjectType: SubjectType,
    subjectId: string,
    rules: Rules
  ): Promise<ApiKey<SubjectType>> {
    const role = await this.saveRole({
      id: this.getApiKeyRoleId(apiKey, subjectType, subjectId),
      name: apiKey,
      type: 'apiKey',
      subjectType,
      subjectId,
      rules,
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
