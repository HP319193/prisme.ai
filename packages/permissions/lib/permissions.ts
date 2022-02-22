import { Ability, ForbiddenError, subject as an } from '@casl/ability';
import { permittedFieldsOf } from '@casl/ability/extra';
import { Rules, SubjectCollaborator, SubjectOptions } from '..';
import { injectRules, nativeRules, sortRules } from './rulesBuilder';
import {
  ForbiddenError as PrismeaiForbiddenError,
  InvalidPermissions,
  UnknownRole,
} from './errors';
import { User, ActionType, RoleTemplates, PermissionsConfig } from './types';

type UserId = string;

export const PublicAccess = '*';
interface Subject<Role extends string> {
  id?: string;
  permissions?: Record<
    UserId,
    {
      role?: Role;
      policies?: Partial<Record<ActionType, boolean>>;
    }
  >;
  [k: string]: any;
}

export class Permissions<
  SubjectType extends string,
  Role extends string = string
> {
  private subjects: Record<SubjectType, SubjectOptions<Role>>;
  private user: User<Role>;
  private roleTemplates: RoleTemplates<SubjectType, Role>;
  private rules: Rules;
  private loadedRoleIds: Set<string>;
  public ability: Ability;

  constructor(user: User<Role>, config: PermissionsConfig<SubjectType, Role>) {
    this.user = user;
    const { rbac, abac, subjects } = config;
    this.roleTemplates = rbac;
    this.subjects = subjects;

    this.loadedRoleIds = new Set();
    this.rules = sortRules([
      ...nativeRules(user, config.rbac, config.subjects),
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
    user: User<Role> | typeof PublicAccess
  ): Subject<Role> {
    this.throwUnlessCan(ActionType.ManagePermissions, subjectType, subject);

    const userId: string = user === PublicAccess ? user : user.id;

    // Update entire user
    if (typeof permission === 'object' && !Array.isArray(permission)) {
      const { role, policies, ...otherFields } =
        permission as SubjectCollaborator<Role>;
      if (Object.keys(otherFields).length) {
        throw new InvalidPermissions(
          `Only allowed permissions fields are 'role' and 'policies' (found ${Object.keys(
            otherFields
          ).join(',')})`
        );
      }

      if (role && !this.findRoleTemplate(role, subjectType)) {
        throw new UnknownRole(
          `Can't assign ${subjectType || ''} role '${role}' to user '${
            this.user.id
          }' as it does not seem to exist .`
        );
      }

      return {
        ...subject,
        permissions: {
          ...subject.permissions,
          [userId]: permission as SubjectCollaborator<Role>,
        },
      };
    }

    // Grant a role
    const roleTemplate = this.findRoleTemplate(permission as Role, subjectType);
    if (typeof permission === 'string' && roleTemplate) {
      const role = permission as Role;
      const contributor = subject.permissions?.[userId] || {};
      return {
        ...subject,
        permissions: {
          ...subject.permissions,
          [userId]: {
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
    const { policies: currentPolicies, ...contributor } =
      subject.permissions?.[userId] || {};

    return {
      ...subject,
      permissions: {
        ...subject.permissions,
        [userId]: {
          ...contributor,
          policies: actions.reduce(
            (policies, permission) => ({
              ...policies,
              [permission]: true,
            }),
            currentPolicies || {}
          ),
        },
      },
    };
  }

  revoke(
    permission: ActionType | ActionType[] | Role | 'all',
    subjectType: SubjectType,
    subject: Subject<Role>,
    user: User<Role> | typeof PublicAccess
  ) {
    this.throwUnlessCan(ActionType.ManagePermissions, subjectType, subject);

    const userId: string = user === PublicAccess ? user : user.id;

    // Revoke a role
    const isExistingRole = !!this.findRoleTemplate(
      permission as Role,
      subjectType
    );
    if (
      typeof permission === 'string' &&
      (permission === 'all' || isExistingRole)
    ) {
      const role = permission;
      const { role: currentRole, ...contributor } =
        subject.permissions?.[userId] || {};
      if (role === 'all') {
        // Revoke all policies & role
        const { [userId]: him, ...contributorsWithoutHim } =
          subject.permissions || {};
        return {
          ...subject,
          permissions: contributorsWithoutHim,
        };
      }

      if (currentRole !== role) {
        return subject;
      }

      return {
        ...subject,
        permissions: {
          ...subject.permissions,
          [userId]: contributor,
        },
      };
    }

    // Revoke an action / list of actions
    const actionsToRevoke = Array.isArray(permission)
      ? permission
      : [permission];
    const { policies: currentPolicies, ...contributor } =
      subject.permissions?.[userId] || {};

    return {
      ...subject,
      permissions: {
        ...subject.permissions,
        [userId]: {
          ...contributor,
          policies: Object.entries(currentPolicies || {}).reduce(
            (policies, [permission, enabled]) => {
              if (actionsToRevoke.includes(permission as ActionType)) {
                return policies;
              }
              return { ...policies, [permission]: enabled };
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
          subjectType || ''
        } role '${role}'.`
      );
    }

    return this.loadRules(roleTemplate?.rules || [], { subject });
  }

  loadRules(rules: Rules, context: Record<string, any> = {}) {
    const injectedRules = injectRules(rules, { user: this.user, ...context });
    this.rules = sortRules([...injectedRules, ...this.rules]);
    this.ability = new Ability(this.rules);
    return this.ability;
  }

  pullRoleFromSubject(subjectType: SubjectType, subject: Subject<Role>) {
    // Auto assign "author" role for subjects created by the user
    const authorAssignedRole = this.subjects[subjectType]?.author?.assignRole;
    if (authorAssignedRole && subject.createdBy === this.user.id) {
      this.loadRole(authorAssignedRole, subjectType, subject);
      return;
    }

    const { role: userRole } = subject.permissions?.[this.user.id] || {};
    if (userRole) {
      this.loadRole(userRole, subjectType, subject);
    }

    const { role: publicRole } = subject.permissions?.[PublicAccess] || {};
    if (publicRole) {
      this.loadRole(publicRole, subjectType, subject);
    }
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
