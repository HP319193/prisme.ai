import { NextFunction, Request, Response } from 'express';
import { Ability, RawRuleOf } from '@casl/ability';

export enum ActionType {
  Manage = 'manage', // Super admin : permits every action
  ManagePermissions = 'manage_permissions',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type UserId = string;

export type UserSubject = any;
export type SubjectCollaborator = {
  role?: string;
  policies?: Partial<Record<ActionType, boolean>>;
};
export type SubjectCollaborators = Record<UserId, SubjectCollaborator>;
export interface BaseSubject {
  id: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  permissions?: SubjectCollaborators;
}
export type Subject<
  CustomAttributes = UserSubject,
  Role extends string = string
> = BaseSubject & CustomAttributes;

export interface User {
  id: UserId;
  sessionId?: string;
  role?: string;
  authData?: Prismeai.User['authData'];
  [k: string]: any;
}

export type Rule = RawRuleOf<Ability> & {
  priority?: number;
};
export type Rules = Rule[];
export interface RoleTemplate<SubjectType extends string, Role extends string> {
  name: Role;
  subjectType?: SubjectType;
  rules: Rules;
}
export type RoleTemplates<
  SubjectType extends string,
  Role extends string
> = RoleTemplate<SubjectType, Role>[];

// This is a special role matching everyone to apply generic "abac" rules through custom roles
export const DefaultRole = 'default';

export interface SubjectOptions<Role> {
  author?: {
    assignRole?: Role;
    disableManagePolicy?: boolean;
  };
}

export interface PermissionsConfig<
  SubjectType extends string,
  Role extends string
> {
  subjects: Record<SubjectType, SubjectOptions<Role>>;
  rbac: RoleTemplates<SubjectType, Role>;
  abac: Rules;
}

export type SubjectRelations<SubjectType extends string> = Record<
  SubjectType,
  SubjectFieldRef<SubjectType>[]
>;

export interface SubjectFieldRef<SubjectType> {
  field: string;
  subject: SubjectType;
}

export type PermissionsMiddleware = (
  req: Request<
    PrismeaiAPI.GetPermissions.PathParameters,
    PrismeaiAPI.GetPermissions.Responses.$200,
    any
  >,
  res: Response<PrismeaiAPI.GetPermissions.Responses.$200>,
  next: NextFunction
) => void;
