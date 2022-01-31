import { Ability, RawRuleOf } from "@casl/ability";

export enum ActionType {
  Manage = "manage", // Super admin : permits every action
  ManageCollaborators = "manage_collaborators",
  Create = "create",
  Read = "read",
  Update = "update",
  Delete = "delete",
}

export type Role = string;
export type UserId = string;

export type UserSubject = Record<string, any>;
export type SubjectCollaborator = {
  role?: Role;
  permissions?: Partial<Record<ActionType, boolean>>;
};
export type SubjectCollaborators = Record<UserId, SubjectCollaborator>;
export interface BaseSubject {
  id: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  collaborators?: SubjectCollaborators;
}
export type Subject<CustomAttributes = UserSubject> = BaseSubject &
  CustomAttributes;

export interface User {
  id: UserId;
  role?: Role;
}

export type Rules = RawRuleOf<Ability>[];
export interface RoleTemplate<SubjectType extends string> {
  name: Role;
  subjectType?: SubjectType;
  rules: RawRuleOf<Ability>[];
}
export type RoleTemplates<SubjectType extends string> =
  RoleTemplate<SubjectType>[];

export interface PermissionsConfig<SubjectType extends string> {
  subjectTypes: SubjectType[];
  rbac: RoleTemplates<SubjectType>;
  abac: Rules;
}
