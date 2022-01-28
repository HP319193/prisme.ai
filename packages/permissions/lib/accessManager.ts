import { BaseSchema } from "./schemas";
import mongoose from "mongoose";
import { accessibleRecordsPlugin, AccessibleRecordModel } from "@casl/mongoose";
import {
  Permissions,
  PermissionsConfig,
  User,
  ActionType,
  Role,
  buildFilterFieldsMethod,
  BaseSubject,
  UserSubject,
} from "..";
import { validateRules } from "./rulesBuilder";
import { ObjectNotFoundError } from "./errors";

type Document<T = any> = mongoose.Document<T> &
  BaseSubject & {
    filterFields: () => T & BaseSubject;
  };

export interface AccessManagerOptions<SubjectType extends string = string> {
  storage: {
    driver?: "mongoose";
    host: string;
    password?: string;
  };
  schemas: Record<SubjectType, mongoose.Schema | Record<string, object>>;
}

export class AccessManager<
  SubjectType extends string,
  SubjectInterfaces extends { [k in SubjectType]: UserSubject }
> {
  private opts: AccessManagerOptions<SubjectType>;
  private models: Record<SubjectType, AccessibleRecordModel<Document>>;
  private permissionsConfig: PermissionsConfig<SubjectType>;
  private permissions?: Permissions<SubjectType>;
  public user?: User;

  constructor(
    opts: AccessManagerOptions<SubjectType>,
    permissionsConfig: Omit<PermissionsConfig<SubjectType>, "subjectTypes">
  ) {
    this.opts = opts;
    this.permissionsConfig = {
      ...permissionsConfig,
      subjectTypes: Object.keys(opts.schemas) as any as SubjectType[],
    };

    const schemas: Record<SubjectType, mongoose.Schema> = Object.entries(
      opts.schemas
    ).reduce((schemas, [name, schemaDef]) => {
      const schema =
        schemaDef instanceof mongoose.Schema
          ? schemaDef
          : new mongoose.Schema(schemaDef as Record<string, object>);

      (schema as mongoose.Schema).plugin(accessibleRecordsPlugin);
      (schema as mongoose.Schema).add(BaseSchema);

      (schema as mongoose.Schema).method(
        "filterFields",
        buildFilterFieldsMethod()
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
      return {
        ...models,
        [name]: mongoose.model(name, schema as mongoose.Schema),
      };
    }, {} as Record<SubjectType, AccessibleRecordModel<Document>>);
  }

  async start() {
    await mongoose.connect(this.opts.storage.host);
  }

  as(user: User): Required<AccessManager<SubjectType, SubjectInterfaces>> {
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
    return permissions.pullRoleFromSubject(subjectType, model.filterFields());
  }

  private async fetch<returnType extends SubjectType>(
    subjectType: returnType,
    id: string
  ): Promise<Document<SubjectInterfaces[returnType]> | null> {
    if (!id) {
      return null;
    }
    const Model = this.model(subjectType);
    const subject = await Model.findOne({ id });

    return subject;
  }

  private model<returnType extends SubjectType>(
    subjectType: returnType
  ): AccessibleRecordModel<Document<SubjectInterfaces[returnType]>> {
    if (!(subjectType in this.models)) {
      throw new Error(`Unknown model ${subjectType}`);
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
  ): Promise<(SubjectInterfaces[returnType] & BaseSubject)[]> {
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
      .map((cur) => cur.filterFields());
  }

  async get<returnType extends SubjectType>(
    subjectType: returnType,
    id: string
  ): Promise<SubjectInterfaces[returnType] & BaseSubject> {
    const { permissions, user } = this.checkAsUser();
    const subject = await this.fetch(subjectType, id);
    if (!subject) {
      throw new ObjectNotFoundError();
    }

    const filtered = subject.filterFields();
    permissions.throwUnlessCan(ActionType.Read, subjectType, filtered);
    return filtered;
  }

  private filterFieldsBeforeUpdate<T>(document: T | Document<T>): T {
    const object: T =
      typeof (<Document>document).toJSON === "function"
        ? ((<Document>document).toJSON() as T)
        : ({ ...document } as T);

    delete (<any>object).createdAt;
    delete (<any>object).createdBy;
    delete (<any>object).updatedAt;
    delete (<any>object).updatedBy;
    delete (<any>object).id;
    delete (<any>object)._id;
    return object;
  }

  async create<returnType extends SubjectType>(
    subjectType: returnType,
    subject: Omit<SubjectInterfaces[returnType], "id"> & { id?: string }
  ): Promise<SubjectInterfaces[returnType] & BaseSubject> {
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
    const doc = object.filterFields();
    permissions.pullRoleFromSubject(subjectType, doc);
    return doc;
  }

  async update<returnType extends SubjectType>(
    subjectType: returnType,
    updatedSubject: SubjectInterfaces[returnType]
  ): Promise<SubjectInterfaces[returnType] & BaseSubject> {
    const { permissions, user } = this.checkAsUser();

    const currentSubject = await this.fetch(subjectType, updatedSubject.id);
    if (!currentSubject) {
      throw new ObjectNotFoundError();
    }

    permissions.throwUnlessCan(
      ActionType.Update,
      subjectType,
      currentSubject.filterFields()
    );

    const date = new Date();
    currentSubject.set({
      ...this.filterFieldsBeforeUpdate(updatedSubject),
      updatedAt: date.toISOString(),
      updatedBy: user.id,
    });
    await currentSubject.save();

    return currentSubject.filterFields();
  }

  async delete<returnType extends SubjectType>(
    subjectType: returnType,
    id: string
  ): Promise<void> {
    const { permissions, user } = this.checkAsUser();
    const subject = await this.fetch(subjectType, id);
    if (!subject) {
      throw new ObjectNotFoundError();
    }

    permissions.throwUnlessCan(
      ActionType.Delete,
      subjectType,
      subject.filterFields()
    );
    await subject.delete();
  }

  async grant<returnType extends SubjectType>(
    permission: ActionType | ActionType[] | Role,
    subjectType: returnType,
    id: string,
    collaborator: User
  ): Promise<SubjectInterfaces[returnType] & BaseSubject> {
    const { permissions, user } = this.checkAsUser();

    const doc = await this.fetch(subjectType, id);
    if (!doc) {
      throw new ObjectNotFoundError();
    }

    const updatedSubject = permissions.grant(
      permission,
      subjectType,
      doc.filterFields(),
      collaborator
    );

    doc.set(updatedSubject);
    await doc.save();
    return doc.filterFields();
  }

  async revoke<returnType extends SubjectType>(
    permission: ActionType | ActionType[] | Role,
    subjectType: returnType,
    id: string,
    collaborator: User
  ): Promise<SubjectInterfaces[returnType] & BaseSubject> {
    const { permissions, user } = this.checkAsUser();

    const doc = await this.fetch(subjectType, id);
    if (!doc) {
      throw new ObjectNotFoundError();
    }

    const updatedSubject = permissions.revoke(
      permission,
      subjectType,
      doc.filterFields(),
      collaborator
    );

    doc.set(updatedSubject);
    await doc.save();
    return doc.filterFields();
  }
}
