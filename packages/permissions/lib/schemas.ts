import { Document, Schema, Types } from 'mongoose';
import { ActionType, Permissions, RoleTemplate, Rules, Subject } from '..';

export const Roles = new Schema<CustomRole<string>>({
  id: { type: String, index: true },
  name: String,
  type: String,
  subjectType: String,
  subjectId: String,
  rules: Schema.Types.Mixed,
  casl: Schema.Types.Mixed,
  disabled: Boolean,
  auth: {
    type: Map,
    required: false,
    of: Schema.Types.Mixed,
  },
});

Roles.index({ 'auth.apiKey.value': 1 });
Roles.index({ name: 1 });

export enum NativeSubjectType {
  Roles = 'roles',
}

export type CustomRole<SubjectType extends string> = RoleTemplate<
  SubjectType,
  string
> & {
  id: string;
  subjectType: SubjectType;
  type: 'apiKey' | 'casl' | 'role';
  subjectId: string;
  disabled?: boolean;
  auth?: Prismeai.WorkspaceRole['auth'] & {
    apiKey?: {
      value?: string;
    };
  };
  casl?: object;
};

export type ApiKey<SubjectType extends string> = {
  apiKey: string;
  name?: string;
  subjectType: SubjectType;
  subjectId: string;
  rules: Rules;
  disabled?: boolean;
};

const PermissionListSchema = new Schema(
  {
    role: String,
    policies: {
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
  permissions: {
    type: Map,
    of: PermissionListSchema,
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
      typeof this.toJSON === 'function' ? this.toJSON() : this;
    if (object._id) {
      if (!object.id) {
        object.id = object._id.toString();
      }
      delete object._id;
    }
    if (typeof object.__v !== 'undefined') {
      delete object.__v;
    }

    if (
      !permissions ||
      !permissions.can(ActionType.ManagePermissions, subjectType, object)
    ) {
      delete object.permissions;
    }

    return object;
  };
}
