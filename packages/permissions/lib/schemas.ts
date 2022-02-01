import { Schema, Document, Types } from "mongoose";
import { ActionType, Permissions, Subject } from "..";

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
