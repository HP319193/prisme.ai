import crypto from 'crypto';
import { BaseSchema, Roles as RolesSchema } from './schemas';
import mongoose from 'mongoose';
import { accessibleRecordsPlugin, AccessibleRecordModel } from '@casl/mongoose';
import {
  ActionType,
  ApiKey,
  BaseSubject,
  buildFilterFieldsMethod,
  CustomRole,
  NativeSubjectType,
  Permissions,
  PermissionsConfig,
  SubjectCollaborator,
  User,
  UserSubject,
  PublicAccess,
} from '..';
import { validateRules } from './rulesBuilder';
import {
  InvalidAPIKey,
  ObjectNotFoundError,
  PrismeError,
  UnknownRole,
} from './errors';

type Document<T, Role extends string> = Omit<mongoose.Document<T>, 'toJSON'> &
  BaseSubject<Role> & {
    filterFields: (
      permissions: Permissions<any, Role>
    ) => T & BaseSubject<Role>;
    toJSON: () => T & BaseSubject<Role>;
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
}

export interface FindOptions {
  pagination?: {
    page?: number;
    limit?: number;
  };
}

const DEFAULT_FIND_PAGE_SIZE = 20;

export class AccessManager<
  SubjectType extends string,
  SubjectInterfaces extends { [k in SubjectType]: UserSubject },
  Role extends string,
  CustomRules = any
> {
  private opts: AccessManagerOptions<SubjectType>;
  private models: Record<
    SubjectType,
    AccessibleRecordModel<Document<any, Role>>
  >;
  private permissionsConfig: PermissionsConfig<SubjectType, Role, CustomRules>;
  private permissions?: Permissions<SubjectType, Role>;
  public user?: User<Role>;

  constructor(
    opts: AccessManagerOptions<SubjectType>,
    permissionsConfig: PermissionsConfig<SubjectType, Role, CustomRules>
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
    }, {} as Record<SubjectType, AccessibleRecordModel<Document<any, Role>>>);
  }

  async start() {
    await mongoose.connect(this.opts.storage.host);
  }

  async as(
    user: User<Role>,
    apiKey?: string
  ): Promise<Required<AccessManager<SubjectType, SubjectInterfaces, Role>>> {
    const child: Required<AccessManager<SubjectType, SubjectInterfaces, Role>> =
      Object.assign({}, this, {
        permissions: new Permissions(user, this.permissionsConfig),
        user: {
          ...user,
          role: user.role || 'guest',
        },
      });
    Object.setPrototypeOf(child, AccessManager.prototype);

    if (apiKey) {
      await child.pullApiKey(apiKey);
    }
    return child;
  }

  async pullRoleFromSubject(subjectType: SubjectType, id: string) {
    const { permissions } = this.checkAsUser();
    const model = await this.fetch(subjectType, id);
    if (!model) {
      return;
    }
    return permissions.pullRoleFromSubject(subjectType, model.toJSON());
  }

  private async fetch<returnType extends SubjectType>(
    subjectType: returnType,
    id: string
  ): Promise<Document<SubjectInterfaces[returnType], Role> | null> {
    if (!id) {
      return null;
    }
    const Model = this.model(subjectType);
    const subject = await Model.findOne({ id });

    return subject;
  }

  private model<returnType extends SubjectType>(
    subjectType: returnType
  ): AccessibleRecordModel<Document<SubjectInterfaces[returnType], Role>> {
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
      Document<SubjectInterfaces[returnType], Role>
    >,
    opts?: FindOptions
  ): Promise<(SubjectInterfaces[returnType] & BaseSubject<Role>)[]> {
    const { permissions } = this.checkAsUser();
    const Model = this.model(subjectType);
    const mongoQuery = Model.accessibleBy(permissions.ability, ActionType.Read);

    const { page = 0, limit = DEFAULT_FIND_PAGE_SIZE } = opts?.pagination || {};
    const accessibleSubjects = await Model.find({
      ...additionalQuery,
      ...mongoQuery.getQuery(),
    })
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
    id: string
  ): Promise<SubjectInterfaces[returnType] & BaseSubject<Role>> {
    const { permissions } = this.checkAsUser();
    const subject = await this.fetch(subjectType, id);
    if (!subject) {
      throw new ObjectNotFoundError();
    }

    permissions.throwUnlessCan(ActionType.Read, subjectType, subject.toJSON());
    return subject.filterFields(permissions);
  }

  private filterFieldsBeforeUpdate<T>(document: T | Document<T, Role>): T {
    const object: T =
      typeof (<Document<any, Role>>document).toJSON === 'function'
        ? ((<Document<any, Role>>document).toJSON() as T)
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
  ): Promise<SubjectInterfaces[returnType] & BaseSubject<Role>> {
    const { permissions, user } = this.checkAsUser();
    permissions.throwUnlessCan(ActionType.Create, subjectType, subject!!);
    const Model = this.model(subjectType);
    const date = new Date();
    const object = new Model({
      ...this.filterFieldsBeforeUpdate(subject),
      createdBy: user.id,
      updatedBy: user.id,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    });
    object.id = subject.id || object._id!!.toString();
    await object.save();
    permissions.pullRoleFromSubject(subjectType, object.toJSON());
    return object.filterFields(permissions);
  }

  async update<returnType extends SubjectType>(
    subjectType: returnType,
    updatedSubject: SubjectInterfaces[returnType]
  ): Promise<SubjectInterfaces[returnType] & BaseSubject<Role>> {
    const { permissions, user } = this.checkAsUser();

    const currentSubject = await this.fetch(subjectType, updatedSubject.id);
    if (!currentSubject) {
      throw new ObjectNotFoundError();
    }

    permissions.throwUnlessCan(
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
    const { permissions } = this.checkAsUser();
    const subject = await this.fetch(subjectType, id);
    if (!subject) {
      throw new ObjectNotFoundError();
    }

    permissions.throwUnlessCan(
      ActionType.Delete,
      subjectType,
      subject.toJSON()
    );
    await subject.delete();
  }

  async grant<returnType extends SubjectType>(
    subjectType: returnType,
    id: string,
    user: User<Role> | typeof PublicAccess,
    permission: ActionType | ActionType[] | Role | SubjectCollaborator<Role>
  ): Promise<SubjectInterfaces[returnType] & BaseSubject<Role>> {
    const { permissions } = this.checkAsUser();

    const doc = await this.fetch(subjectType, id);
    if (!doc) {
      throw new ObjectNotFoundError();
    }

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
    user: User<Role> | typeof PublicAccess,
    permission: ActionType | ActionType[] | Role | 'all' = 'all'
  ): Promise<SubjectInterfaces[returnType] & BaseSubject<Role>> {
    const { permissions } = this.checkAsUser();

    const doc = await this.fetch(subjectType, id);
    if (!doc) {
      throw new ObjectNotFoundError();
    }

    const updatedSubject = permissions.revoke(
      permission,
      subjectType,
      doc.toJSON(),
      user
    );

    doc.set(updatedSubject);
    await doc.save();
    return doc.filterFields(permissions);
  }

  can<returnType extends SubjectType>(
    actionType: ActionType,
    subjectType: returnType,
    subject: SubjectInterfaces[returnType]
  ): boolean {
    const { permissions } = this.checkAsUser();
    return permissions.can(actionType, subjectType, subject);
  }

  async throwUnlessCan<returnType extends SubjectType>(
    actionType: ActionType,
    subjectType: SubjectType,
    idOrSubject: SubjectInterfaces[returnType] | string
  ) {
    const { permissions } = this.checkAsUser();

    const subject =
      typeof idOrSubject === 'string'
        ? await this.fetch(subjectType, idOrSubject)
        : idOrSubject;
    if (!subject) {
      throw new ObjectNotFoundError();
    }

    permissions.throwUnlessCan(
      actionType,
      subjectType,
      typeof subject.toJSON === 'function' ? subject.toJSON() : subject
    );

    return true;
  }

  filterSubjectsBy<returnType extends SubjectType>(
    actionType: ActionType,
    subjectType: returnType,
    subjects: SubjectInterfaces[returnType][]
  ): SubjectInterfaces[returnType][] {
    const { permissions } = this.checkAsUser();
    return subjects.filter((cur) =>
      permissions.can(actionType, subjectType, cur)
    );
  }

  private async pullRole(
    query: mongoose.FilterQuery<
      Document<CustomRole<SubjectType, CustomRules>, Role>
    >
  ) {
    const { permissions } = this.checkAsUser();
    const RolesModel = (await this.model(
      <any>NativeSubjectType.Roles
    )) as any as AccessibleRecordModel<
      Document<CustomRole<SubjectType, CustomRules>, any>
    >;

    const docs = await RolesModel.find(query);

    if (!docs.length) {
      throw new UnknownRole();
    }
    permissions.loadRules(
      docs.flatMap((cur) => {
        return JSON.parse(cur.toJSON().casl as any as string);
      })
    );
  }

  async saveRole(
    role: Omit<CustomRole<SubjectType, CustomRules>, 'casl'>
  ): Promise<CustomRole<SubjectType, CustomRules>> {
    if (!role.id) {
      throw new PrismeError('A role id is required for saving');
    }
    const rulesBuilder = this.permissionsConfig.customRulesBuilder;
    if (!rulesBuilder) {
      throw new Error(
        'Cannot save any custom role without specifying the rules builder inside permissions config !'
      );
    }
    await this.throwUnlessCan(
      ActionType.ManagePermissions,
      role.subjectType,
      role.subjectId
    );

    const RolesModel = (await this.model(
      <any>NativeSubjectType.Roles
    )) as any as AccessibleRecordModel<
      Document<CustomRole<SubjectType, CustomRules>, any>
    >;
    const casl = rulesBuilder(role);

    const savedApiKey = await RolesModel.findOneAndUpdate(
      {
        id: role.id,
      },
      {
        ...role,
        casl: JSON.stringify(casl), // MongoDB would reject $ characters
      },
      {
        new: true,
        upsert: true,
      }
    );

    return {
      ...savedApiKey.toJSON(),
      casl,
    };
  }

  async deleteRole(id: string): Promise<boolean> {
    const RolesModel = (await this.model(
      <any>NativeSubjectType.Roles
    )) as any as AccessibleRecordModel<
      Document<CustomRole<SubjectType, CustomRules>, any>
    >;

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
    subjectType: SubjectType,
    subjectId: string
  ): Promise<CustomRole<SubjectType, CustomRules>[]> {
    await this.throwUnlessCan(
      ActionType.ManagePermissions,
      subjectType,
      subjectId
    );

    const RolesModel = (await this.model(
      <any>NativeSubjectType.Roles
    )) as any as AccessibleRecordModel<
      Document<CustomRole<SubjectType, CustomRules>, any>
    >;

    const docs = await RolesModel.find({
      subjectType,
      subjectId,
    });
    return docs
      .map((cur) => cur.toJSON())
      .map((cur) => ({
        ...cur,
        casl: JSON.parse(cur.casl as any),
      }));
  }

  async pullApiKey(apiKey: string) {
    try {
      return await this.pullRole({ name: apiKey });
    } catch (error) {
      throw new InvalidAPIKey();
    }
  }

  private convertRoleToApiKey(
    role: CustomRole<SubjectType, CustomRules>
  ): ApiKey<SubjectType, CustomRules> {
    delete (<any>role)._id;
    delete (<any>role).__v;
    const { name, casl, type, id, ...sharedFields } = role;
    return {
      ...sharedFields,
      apiKey: name,
      rules: role.rules || ({} as any),
    };
  }

  async findApiKeys(
    subjectType: SubjectType,
    subjectId: string
  ): Promise<ApiKey<SubjectType, CustomRules>[]> {
    const roles = await this.findRoles(subjectType, subjectId);
    return roles
      .filter((cur) => cur.type === 'apiKey')
      .map(this.convertRoleToApiKey);
  }

  private getApiKeyRoleId(
    apiKey: string,
    subjectType: SubjectType,
    subjectId: string
  ) {
    return `apiKey/${apiKey}/${subjectType}/${subjectId}/`;
  }

  async createApiKey(
    subjectType: SubjectType,
    subjectId: string,
    rules: CustomRules
  ): Promise<ApiKey<SubjectType, CustomRules>> {
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
    rules: CustomRules
  ): Promise<ApiKey<SubjectType, CustomRules>> {
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
}
