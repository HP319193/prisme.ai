import { Schema, Document } from "mongoose";
import { ActionType, Subject } from "..";

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

export function buildFilterFieldsMethod() {
  return function (
    this: Document | Subject,
    action: ActionType = ActionType.Read
  ) {
    const object: Subject =
      typeof this.toJSON === "function" ? this.toJSON() : this;
    if (object._id) {
      object.id = object._id.toString();
      delete object._id;
    }
    if (typeof object.__v !== "undefined") {
      delete object.__v;
    }

    return object;
  };
}
