import { NextFunction, Request, Response } from 'express';
import { Ability, RawRuleOf } from '@casl/ability';
import { CustomRole } from '..';

export enum ActionType {
  Manage = 'manage', // Super admin : permits every action
  ManagePermissions = 'manage_permissions',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type UserId = string;

export type UserSubject = Record<string, any>;
export type SubjectCollaborator<Role extends string> = {
  role?: Role;
  policies?: Partial<Record<ActionType, boolean>>;
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
  permissions?: SubjectCollaborators<Role>;
}
export type Subject<
  CustomAttributes = UserSubject,
  Role extends string = string
> = BaseSubject<Role> & CustomAttributes;

export interface User<Role extends string> {
  id: UserId;
  sessionId: string;
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

export interface SubjectOptions<Role> {
  author?: {
    assignRole?: Role;
    disableManagePolicy?: boolean;
  };
}

export interface PermissionsConfig<
  SubjectType extends string,
  Role extends string,
  CustomRules = any
> {
  subjects: Record<SubjectType, SubjectOptions<Role>>;
  rbac: RoleTemplates<SubjectType, Role>;
  abac: Rules;
  customRulesBuilder?: (
    role: Omit<CustomRole<SubjectType, CustomRules>, 'casl'>
  ) => RawRuleOf<Ability>[];
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
