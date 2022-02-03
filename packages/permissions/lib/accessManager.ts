import { BaseSchema, Roles as RolesSchema, Roles } from "./schemas";
import mongoose from "mongoose";
import { accessibleRecordsPlugin, AccessibleRecordModel } from "@casl/mongoose";
import {
  Permissions,
  PermissionsConfig,
  User,
  ActionType,
  buildFilterFieldsMethod,
  BaseSubject,
  UserSubject,
  SubjectCollaborator,
  NativeSubjectType,
  CustomRole,
} from "..";
import { validateRules } from "./rulesBuilder";
import { InvalidAPIKey, ObjectNotFoundError, PrismeError } from "./errors";

type Document<T, Role extends string> = Omit<mongoose.Document<T>, "toJSON"> &
  BaseSubject<Role> & {
    filterFields: (
      permissions: Permissions<any, Role>
    ) => T & BaseSubject<Role>;
    toJSON: () => T & BaseSubject<Role>;
  };

export interface AccessManagerOptions<SubjectType extends string = string> {
  storage: {
    driver?: "mongoose";
    host: string;
    password?: string;
  };
  schemas: Record<
    SubjectType,
    false | mongoose.Schema | Record<string, object>
  >;
}

export class AccessManager<
  SubjectType extends string,
  SubjectInterfaces extends { [k in SubjectType]: UserSubject },
  Role extends string
> {
  private opts: AccessManagerOptions<SubjectType>;
  private models: Record<
    SubjectType,
    AccessibleRecordModel<Document<any, Role>>
  >;
  private permissionsConfig: PermissionsConfig<SubjectType, Role>;
  private permissions?: Permissions<SubjectType, Role>;
  public user?: User<Role>;

  constructor(
    opts: AccessManagerOptions<SubjectType>,
    permissionsConfig: Omit<
      PermissionsConfig<SubjectType, Role>,
      "subjectTypes"
    >
  ) {
    this.opts = opts;
    this.permissionsConfig = {
      ...permissionsConfig,
      subjectTypes: Object.keys(opts.schemas) as any as SubjectType[],
    };

    const schemas: Record<SubjectType, mongoose.Schema | false> =
      Object.entries({
        ...opts.schemas,
        [NativeSubjectType.Roles]: RolesSchema,
      }).reduce((schemas, [name, schemaDef]) => {
        if (schemaDef === false) {
          return { ...schemas, [name]: false };
        }
        const schema =
          schemaDef instanceof mongoose.Schema
            ? schemaDef
            : new mongoose.Schema(schemaDef as Record<string, object>);

        (schema as mongoose.Schema).plugin(accessibleRecordsPlugin);
        (schema as mongoose.Schema).add(BaseSchema);

        (schema as mongoose.Schema).method(
          "filterFields",
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

  as(
    user: User<Role>
  ): Required<AccessManager<SubjectType, SubjectInterfaces, Role>> {
    const child = Object.assign({}, this, {
      permissions: new Permissions(user, this.permissionsConfig),
      user: {
        ...user,
        role: user.role || "guest",
      },
    });
    Object.setPrototypeOf(child, AccessManager.prototype);
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
        "You must call AccessManager.as(user) method before anything else."
      );
    }
    return { permissions, user };
  }

  async findAll<returnType extends SubjectType>(
    subjectType: returnType
  ): Promise<(SubjectInterfaces[returnType] & BaseSubject<Role>)[]> {
    const { permissions } = this.checkAsUser();
    const Model = this.model(subjectType);
    const query = Model.accessibleBy(
      permissions.ability,
      ActionType.Read
    ).getQuery();

    const accessibleSubjects = await Model.find(query);
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
      typeof (<Document<any, Role>>document).toJSON === "function"
        ? ((<Document<any, Role>>document).toJSON() as T)
        : ({ ...document } as T);

    delete (<any>object).createdAt;
    delete (<any>object).createdBy;
    delete (<any>object).updatedAt;
    delete (<any>object).updatedBy;
    delete (<any>object).id;
    delete (<any>object)._id;
    delete (<any>object).collaborators;
    return object;
  }

  async create<returnType extends SubjectType>(
    subjectType: returnType,
    subject: Omit<SubjectInterfaces[returnType], "id"> & { id?: string }
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
    collaborator: User<Role>,
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
      collaborator
    );

    doc.set(updatedSubject);
    await doc.save();
    return doc.filterFields(permissions);
  }

  async revoke<returnType extends SubjectType>(
    subjectType: returnType,
    id: string,
    collaborator: User<Role>,
    permission: ActionType | ActionType[] | Role | "all" = "all"
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
      collaborator
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
      typeof idOrSubject === "string"
        ? await this.fetch(subjectType, idOrSubject)
        : idOrSubject;
    if (!subject) {
      throw new ObjectNotFoundError();
    }

    permissions.throwUnlessCan(
      actionType,
      subjectType,
      typeof subject.toJSON === "function" ? subject.toJSON() : subject
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
    query:
      | {
          id: string;
        }
      | {
          apiKey: string;
        }
  ) {
    const { permissions } = this.checkAsUser();
    const RolesModel = (await this.model(
      <any>NativeSubjectType.Roles
    )) as any as AccessibleRecordModel<Document<CustomRole<SubjectType>, any>>;

    const docs =
      typeof (<any>query).id !== "undefined"
        ? await RolesModel.find({
            _id: new mongoose.Types.ObjectId((<any>query).id),
          })
        : await RolesModel.find(query);

    if (!docs.length) {
      throw new InvalidAPIKey();
    }
    permissions.loadRules(
      docs.flatMap((cur) => {
        return JSON.parse(cur.toJSON().rules as any as string);
      })
    );
  }

  async saveRole(
    role: Omit<CustomRole<SubjectType>, "rules">
  ): Promise<CustomRole<SubjectType>> {
    const roleBuilder = this.permissionsConfig.roleBuilder;
    if (!roleBuilder) {
      throw new Error(
        "Cannot save any custom role without specifying the role builder inside permissions config !"
      );
    }
    const { permissions } = this.checkAsUser();
    permissions.throwUnlessCan(
      ActionType.ManageCollaborators,
      role.subjectType,
      {
        id: role.subjectId,
      }
    );

    const RolesModel = (await this.model(
      <any>NativeSubjectType.Roles
    )) as any as AccessibleRecordModel<Document<CustomRole<SubjectType>, any>>;
    const rules = roleBuilder(role);

    const savedApiKey = await RolesModel.findOneAndUpdate(
      {
        apiKey: role.apiKey,
        subjectType: role.subjectType,
        subjectId: role.subjectId,
      },
      {
        ...role,
        rules: JSON.stringify(rules), // MongoDB would reject $ characters
      },
      {
        new: true,
        upsert: true,
      }
    );

    return {
      ...savedApiKey.toJSON(),
      rules,
    };
  }

  async findRoles(
    subjectType: SubjectType,
    subjectId: string
  ): Promise<CustomRole<SubjectType>[]> {
    const { permissions } = this.checkAsUser();
    permissions.throwUnlessCan(ActionType.ManageCollaborators, subjectType, {
      id: subjectId,
    });

    const RolesModel = (await this.model(
      <any>NativeSubjectType.Roles
    )) as any as AccessibleRecordModel<Document<CustomRole<SubjectType>, any>>;

    const docs = await RolesModel.find({
      subjectType,
      subjectId,
    });
    return docs
      .map((cur) => cur.toJSON())
      .map((cur) => ({
        ...cur,
        rules: JSON.parse(cur.rules as any),
      }));
  }
}
