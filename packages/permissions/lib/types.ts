import { Ability, RawRuleOf } from "@casl/ability";
import { CustomRole } from "..";

export enum ActionType {
  Manage = "manage", // Super admin : permits every action
  ManageCollaborators = "manage_collaborators",
  Create = "create",
  Read = "read",
  Update = "update",
  Delete = "delete",
}

export type UserId = string;

export type UserSubject = Record<string, any>;
export type SubjectCollaborator<Role extends string> = {
  role?: Role;
  permissions?: Partial<Record<ActionType, boolean>>;
};
export type SubjectCollaborators<Role extends string> = Record<
  UserId,
  SubjectCollaborator<Role>
>;
export interface BaseSubject<Role extends string> {
  id: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  collaborators?: SubjectCollaborators<Role>;
}
export type Subject<
  CustomAttributes = UserSubject,
  Role extends string = string
> = BaseSubject<Role> & CustomAttributes;

export interface User<Role extends string> {
  id: UserId;
  role?: Role;
}

export type Rules = RawRuleOf<Ability>[];
export interface RoleTemplate<SubjectType extends string, Role extends string> {
  name: Role;
  subjectType?: SubjectType;
  rules: RawRuleOf<Ability>[];
}
export type RoleTemplates<
  SubjectType extends string,
  Role extends string
> = RoleTemplate<SubjectType, Role>[];

export interface PermissionsConfig<
  SubjectType extends string,
  Role extends string,
  CustomRules = any
> {
  subjectTypes: SubjectType[];
  rbac: RoleTemplates<SubjectType, Role>;
  abac: Rules;
  customRulesBuilder?: (
    role: Omit<CustomRole<SubjectType, CustomRules>, "casl">
  ) => RawRuleOf<Ability>[];
}
