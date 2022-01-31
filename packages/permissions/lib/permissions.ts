import { Ability, ForbiddenError, subject as an } from "@casl/ability";

import { permittedFieldsOf } from "@casl/ability/extra";
import { Rules } from "..";
import { injectRules, nativeRules, sortRules } from "./rulesBuilder";
import {
  UnknownRole,
  ForbiddenError as PrismeaiForbiddenError,
} from "./errors";
import {
  User,
  // Subject,
  ActionType,
  Role,
  RoleTemplates,
  PermissionsConfig,
} from "./types";

type UserId = string;
interface Subject {
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

export class Permissions<SubjectType extends string> {
  private user: User;
  private roleTemplates: RoleTemplates<SubjectType>;
  private rules: Rules;
  private loadedRoleIds: Set<string>;
  public ability: Ability;

  constructor(user: User, config: PermissionsConfig<SubjectType>) {
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
    permission: ActionType | ActionType[] | Role,
    subjectType: SubjectType,
    subject: Subject,
    collaborator: User
  ) {
    this.throwUnlessCan(ActionType.ManageCollaborators, subjectType, subject);

    // Grant a role
    const roleTemplate = this.findRoleTemplate(permission as Role, subjectType);
    if (typeof permission === "string" && roleTemplate) {
      const role = permission;
      const contributor = subject.collaborators?.[collaborator.id] || {};
      return {
        ...subject,
        collaborators: {
          ...subject.collaborators,
          [collaborator.id]: {
            ...contributor,
            role,
          },
        },
      };
    }

    // Grant an action / list of actions
    const actions = Array.isArray(permission) ? permission : [permission];
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
    subject: Subject,
    collaborator: User
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
      if (currentRole !== role) {
        return subject;
      }
      if (role === "all") {
        // Revoke all permissions & role
        const { [collaborator.id]: him, ...contributorsWithoutHim } =
          subject.collaborators || {};
        return {
          ...subject,
          collaborators: contributorsWithoutHim,
        };
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
  private loadRole(role: Role, subjectType?: SubjectType, subject?: Subject) {
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

  pullRoleFromSubject(subjectType: SubjectType, subject: Subject) {
    // Auto assign "admin" role for subjects created by the user
    if (
      subject.createdBy === this.user.id &&
      this.findRoleTemplate("admin", subjectType)
    ) {
      this.loadRole("admin", subjectType, subject);
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
    subject?: Subject,
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

  throwUnlessCan(action: string, subjectType: SubjectType, subject?: Subject) {
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
    subject?: Subject
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
