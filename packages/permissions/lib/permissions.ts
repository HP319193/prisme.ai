import { Ability, ForbiddenError, subject as an } from "@casl/ability";

import { permittedFieldsOf } from "@casl/ability/extra";
import { Rules, SubjectCollaborator } from "..";
import { injectRules, nativeRules, sortRules } from "./rulesBuilder";
import {
  UnknownRole,
  ForbiddenError as PrismeaiForbiddenError,
  InvalidCollaborator,
} from "./errors";
import { User, ActionType, RoleTemplates, PermissionsConfig } from "./types";

type UserId = string;
interface Subject<Role extends string> {
  id?: string;
  collaborators?: Record<
    UserId,
    {
      role?: Role;
      permissions?: Partial<Record<ActionType, boolean>>;
    }
  >;
  [k: string]: any;
}

export class Permissions<
  SubjectType extends string,
  Role extends string = string
> {
  private user: User<Role>;
  private roleTemplates: RoleTemplates<SubjectType, Role>;
  private rules: Rules;
  private loadedRoleIds: Set<string>;
  public ability: Ability;

  constructor(user: User<Role>, config: PermissionsConfig<SubjectType, Role>) {
    this.user = user;
    const { rbac, abac } = config;
    this.roleTemplates = rbac;

    this.loadedRoleIds = new Set();
    this.rules = sortRules([
      ...nativeRules(user, config.rbac, config.subjectTypes),
      ...injectRules(abac, { user }),
    ]);
    this.ability = new Ability(this.rules);
    if (user.role) {
      this.loadRole(user.role);
    }
  }

  private findRoleTemplate(role: Role, subjectType?: SubjectType) {
    return this.roleTemplates.find(
      (cur) => cur.name === role && cur.subjectType == subjectType
    );
  }

  grant(
    permission: ActionType | ActionType[] | Role | SubjectCollaborator<Role>,
    subjectType: SubjectType,
    subject: Subject<Role>,
    collaborator: User<Role>
  ): Subject<Role> {
    this.throwUnlessCan(ActionType.ManageCollaborators, subjectType, subject);

    // Update entire collaborator
    if (typeof permission === "object" && !Array.isArray(permission)) {
      const { role, permissions, ...otherFields } =
        permission as SubjectCollaborator<Role>;
      if (Object.keys(otherFields).length) {
        throw new InvalidCollaborator(
          `Only allowed collaborator fields are 'role' and 'permissions' (found ${Object.keys(
            otherFields
          ).join(",")})`
        );
      }

      if (role && !this.findRoleTemplate(role, subjectType)) {
        throw new UnknownRole(
          `Can't assign ${subjectType || ""} role '${role}' to user '${
            this.user.id
          }' as it does not seem to exist .`
        );
      }

      return {
        ...subject,
        collaborators: {
          ...subject.collaborators,
          [collaborator.id]: permission as SubjectCollaborator<Role>,
        },
      };
    }

    // Grant a role
    const roleTemplate = this.findRoleTemplate(permission as Role, subjectType);
    if (typeof permission === "string" && roleTemplate) {
      const role = permission as Role;
      const contributor = subject.collaborators?.[collaborator.id] || {};
      return {
        ...subject,
        collaborators: {
          ...subject.collaborators,
          [collaborator.id]: {
            ...contributor,
            role: role,
          },
        },
      };
    }

    // Grant an action / list of actions
    const actions = (
      Array.isArray(permission) ? permission : [permission]
    ) as string[];
    const { permissions: currentPermissions, ...contributor } =
      subject.collaborators?.[collaborator.id] || {};

    return {
      ...subject,
      collaborators: {
        ...subject.collaborators,
        [collaborator.id]: {
          ...contributor,
          permissions: actions.reduce(
            (permissions, permission) => ({
              ...permissions,
              [permission]: true,
            }),
            currentPermissions || {}
          ),
        },
      },
    };
  }

  revoke(
    permission: ActionType | ActionType[] | Role | "all",
    subjectType: SubjectType,
    subject: Subject<Role>,
    collaborator: User<Role>
  ) {
    this.throwUnlessCan(ActionType.ManageCollaborators, subjectType, subject);

    // Revoke a role
    const isExistingRole = !!this.findRoleTemplate(
      permission as Role,
      subjectType
    );
    if (
      typeof permission === "string" &&
      (permission === "all" || isExistingRole)
    ) {
      const role = permission;
      const { role: currentRole, ...contributor } =
        subject.collaborators?.[collaborator.id] || {};
      if (role === "all") {
        // Revoke all permissions & role
        const { [collaborator.id]: him, ...contributorsWithoutHim } =
          subject.collaborators || {};
        return {
          ...subject,
          collaborators: contributorsWithoutHim,
        };
      }

      if (currentRole !== role) {
        return subject;
      }

      return {
        ...subject,
        collaborators: {
          ...subject.collaborators,
          [collaborator.id]: contributor,
        },
      };
    }

    // Revoke an action / list of actions
    const actionsToRevoke = Array.isArray(permission)
      ? permission
      : [permission];
    const { permissions: currentPermissions, ...contributor } =
      subject.collaborators?.[collaborator.id] || {};

    return {
      ...subject,
      collaborators: {
        ...subject.collaborators,
        [collaborator.id]: {
          ...contributor,
          permissions: Object.entries(currentPermissions || {}).reduce(
            (permissions, [permission, enabled]) => {
              if (actionsToRevoke.includes(permission as ActionType)) {
                return permissions;
              }
              return { ...permissions, [permission]: enabled };
            },
            {}
          ),
        },
      },
    };
  }

  // Update current ability with a new role, which might be related to a specific subject
  private loadRole(
    role: Role,
    subjectType?: SubjectType,
    subject?: Subject<Role>
  ) {
    const roleId = subjectType ? `${subjectType}/${subject?.id}` : role;
    if (this.loadedRoleIds.has(roleId)) {
      return;
    }
    this.loadedRoleIds.add(roleId);
    const roleTemplate = role
      ? this.findRoleTemplate(role, subjectType)
      : undefined;
    if (!roleTemplate) {
      throw new UnknownRole(
        `User '${this.user.id}' is assigned an unknown ${
          subjectType || ""
        } role '${role}'.`
      );
    }
    const roleRules = roleTemplate
      ? injectRules(roleTemplate.rules, { user: this.user, subject })
      : [];

    this.rules = sortRules([...roleRules, ...this.rules]);
    this.ability = new Ability(this.rules);
    return this.ability;
  }

  pullRoleFromSubject(subjectType: SubjectType, subject: Subject<Role>) {
    // Auto assign "admin" role for subjects created by the user
    if (
      subject.createdBy === this.user.id &&
      this.findRoleTemplate("admin" as Role, subjectType)
    ) {
      this.loadRole("admin" as Role, subjectType, subject);
      return;
    }

    const { role } = subject.collaborators?.[this.user.id] || {};
    if (!role) {
      return;
    }
    this.loadRole(role, subjectType, subject);
  }

  can(
    action: string,
    subjectType: SubjectType,
    subject?: Subject<Role>,
    field?: string
  ) {
    if (subject) {
      this.pullRoleFromSubject(subjectType, subject);
    }
    return this.ability.can(
      action,
      subject ? an(subjectType, subject) : subjectType,
      field
    );
  }

  throwUnlessCan(
    action: string,
    subjectType: SubjectType,
    subject?: Subject<Role>
  ) {
    if (subject) {
      this.pullRoleFromSubject(subjectType, subject);
    }
    try {
      ForbiddenError.from(this.ability).throwUnlessCan(
        action,
        subject ? an(subjectType, subject) : subjectType
      );
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw new PrismeaiForbiddenError(error.message, {
          action: error.action,
          subjectType: error.subjectType,
        });
      }
      throw error;
    }
  }

  permittedFieldsFor(
    action: string,
    subjectType: SubjectType,
    subject?: Subject<Role>
  ) {
    return permittedFieldsOf(
      this.ability,
      action,
      subject ? an(subjectType, subject) : subjectType,
      {
        fieldsFrom: (rule) => {
          return rule.fields || [];
        },
      }
    );
  }
}
