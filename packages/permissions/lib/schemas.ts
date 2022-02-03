import { Schema, Document, Types } from "mongoose";
import { ActionType, Permissions, Rules, Subject } from "..";
import { SubjectType } from "../examples/accessManagement";

export const Roles = new Schema({
  id: { type: String, index: true },
  name: String,
  // apiKey: { type: String, sparse: true },
  type: String,
  subjectType: String,
  subjectId: String,
  rules: Schema.Types.Mixed,
  casl: Schema.Types.Mixed,
});

export enum NativeSubjectType {
  Roles = "roles",
}

export type CustomRole<SubjectType extends string, CustomRules = any> = {
  name: string;
  id: string;
  type: "apiKey";
  subjectType: SubjectType;
  subjectId: string;
  rules: CustomRules;
  casl: Rules;
};

export type ApiKey<SubjectType extends string, CustomRules = any> = Omit<
  CustomRole<SubjectType, CustomRules>,
  "name" | "casl" | "type" | "id"
> & {
  apiKey: string;
};

const CollaboratorSchema = new Schema(
  {
    role: String,
    permissions: {
      type: Map,
      of: Boolean,
    },
  },
  {
    _id: false,
  }
);

const BaseSchema = new Schema({
  _id: { type: Types.ObjectId, auto: true },
  id: { type: String, index: true, unique: true },
  createdBy: String,
  updatedBy: String,
  createdAt: String,
  updatedAt: String,
  collaborators: {
    type: Map,
    of: CollaboratorSchema,
    index: true,
  },
});

export { BaseSchema };

export function buildFilterFieldsMethod<SubjectType extends string>(
  subjectType: SubjectType
) {
  return function (
    this: Document | Subject,
    permissions?: Permissions<SubjectType>
  ) {
    const object: Subject =
      typeof this.toJSON === "function" ? this.toJSON() : this;
    if (object._id) {
      if (!object.id) {
        object.id = object._id.toString();
      }
      delete object._id;
    }
    if (typeof object.__v !== "undefined") {
      delete object.__v;
    }

    if (
      !permissions ||
      !permissions.can(ActionType.ManageCollaborators, subjectType, object)
    ) {
      delete object.collaborators;
    }

    return object;
  };
}
