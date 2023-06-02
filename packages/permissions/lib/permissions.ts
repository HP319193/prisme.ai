import { Ability, ForbiddenError, subject as an } from '@casl/ability';
import { permittedFieldsOf } from '@casl/ability/extra';
import { Rules, SubjectCollaborator, SubjectOptions } from '..';
import { injectRules, nativeRules, sortRules } from './rulesBuilder';
import {
  ForbiddenError as PrismeaiForbiddenError,
  InvalidPermissions,
  UnknownRole,
} from './errors';
import {
  User,
  ActionType,
  RoleTemplates,
  PermissionsConfig,
  RoleTemplate,
  DefaultRole,
  SubjectRelations,
} from './types';
import {
  buildSubjectRelations,
  getParentSubjectIds,
  permissionTargetToId,
  PublicAccess,
  RolePrefix,
} from './utils';

type UserId = string;

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

type Role = string;
export class Permissions<SubjectType extends string> {
  private subjects: Record<SubjectType, SubjectOptions<Role>>;
  private user: User;
  private roleTemplates: RoleTemplates<SubjectType, Role>;
  private abac: Rules;
  private rules: Rules;
  private subjectRelations: SubjectRelations<SubjectType>;
  private loadedRoleIds: Set<string>;
  private loadedSubjectRoles: Record<string, string>; // map subjectType+subjectId to its role
  public ability: Ability;

  constructor(user: User, config: PermissionsConfig<SubjectType, Role>) {
    this.user = user;
    const { rbac, abac, subjects } = config;
    this.roleTemplates = rbac;
    this.abac = abac;
    this.subjects = subjects;

    this.loadedRoleIds = new Set();
    this.loadedSubjectRoles = {};
    this.rules = sortRules([
      ...nativeRules(user, config.rbac, config.subjects),
      ...injectRules(abac, { user }),
    ]);
    this.ability = new Ability(this.rules);
    if (user.role) {
      this.loadRole(user.role);
    }
    this.subjectRelations = buildSubjectRelations(config);
  }

  public loadRoles(roles: RoleTemplates<SubjectType, Role>) {
    const newRolesMapping = roles.reduce<
      Record<string, RoleTemplate<SubjectType, Role>>
    >(
      (mapping, role) => ({
        ...mapping,
        [`${role.subjectType}.${role.name}`]: role,
      }),
      {}
    );

    const currentRolesMapping = this.roleTemplates.reduce<
      Record<string, RoleTemplate<SubjectType, Role>>
    >(
      (mapping, role) => ({
        ...mapping,
        [`${role.subjectType}.${role.name}`]: role,
      }),
      {}
    );

    this.roleTemplates = Object.values({
      ...currentRolesMapping,
      ...newRolesMapping,
    });
  }

  private findRoleTemplate(role: Role, subjectType?: SubjectType) {
    return this.roleTemplates.find(
      (cur) =>
        cur.name === role && (cur.subjectType == subjectType || !subjectType)
    );
  }

  grant(
    permission: ActionType | ActionType[] | Role | SubjectCollaborator,
    subjectType: SubjectType,
    subject: Subject<Role>,
    target: Prismeai.UserPermissionsTarget
  ): Subject<Role> {
    this.throwUnlessCan(ActionType.ManagePermissions, subjectType, subject);

    const targetStr = permissionTargetToId(target);

    if (target.role && !this.findRoleTemplate(target.role as Role)) {
      throw new UnknownRole(
        `Can't assign permissions to users with role '${target.role}' as it does not seem to exist .`
      );
    }

    // Update entire user
    if (typeof permission === 'object' && !Array.isArray(permission)) {
      const { role, policies, ...otherFields } =
        permission as SubjectCollaborator;
      if (Object.keys(otherFields).length) {
        throw new InvalidPermissions(
          `Only allowed permissions fields are 'role' and 'policies' (found ${Object.keys(
            otherFields
          ).join(',')})`
        );
      }

      if (role && !this.findRoleTemplate(role, subjectType)) {
        throw new UnknownRole(
          `Can't assign ${
            subjectType || ''
          } role '${role}' to '${targetStr}' as role '${role}' does not seem to exist .`
        );
      }

      return {
        ...subject,
        permissions: {
          ...subject.permissions,
          [targetStr]: permission as SubjectCollaborator,
        },
      };
    }

    // Grant a role
    const roleTemplate = this.findRoleTemplate(permission as Role, subjectType);
    if (typeof permission === 'string' && roleTemplate) {
      const role = permission as Role;
      const contributor = subject.permissions?.[targetStr] || {};
      return {
        ...subject,
        permissions: {
          ...subject.permissions,
          [targetStr]: {
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
      subject.permissions?.[targetStr] || {};

    return {
      ...subject,
      permissions: {
        ...subject.permissions,
        [targetStr]: {
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
    permId: string
  ) {
    this.throwUnlessCan(ActionType.ManagePermissions, subjectType, subject);

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
        subject.permissions?.[permId] || {};
      if (role === 'all') {
        // Revoke all policies & role
        const { [permId]: him, ...contributorsWithoutHim } =
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
          [permId]: contributor,
        },
      };
    }

    // Revoke an action / list of actions
    const actionsToRevoke = Array.isArray(permission)
      ? permission
      : [permission];
    const { policies: currentPolicies, ...contributor } =
      subject.permissions?.[permId] || {};

    return {
      ...subject,
      permissions: {
        ...subject.permissions,
        [permId]: {
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
    // Either a role name or object ready to use
    role: Role | RoleTemplate<SubjectType, Role>,
    subjectType?: SubjectType,
    subject?: Subject<Role>
  ) {
    const roleId = subjectType
      ? `${subjectType}/${subject?.id}/${(<any>role)?.name || role}`
      : (<any>role)?.name || role;
    if (this.loadedRoleIds.has(roleId)) {
      return;
    }
    this.loadedRoleIds.add(roleId);

    let roleTemplate: RoleTemplate<SubjectType, Role> | undefined = role as any;
    if (typeof roleTemplate === 'string') {
      roleTemplate = this.findRoleTemplate(roleTemplate, subjectType);
    }
    if (!roleTemplate && role !== DefaultRole) {
      throw new UnknownRole(
        `User '${this.user.id}' is assigned an unknown ${
          subjectType || ''
        } role '${role}'.`
      );
    } else if (!roleTemplate) {
      return;
    }

    return this.loadRules(roleTemplate?.rules || [], { subject });
  }

  updateUserRules(user: User) {
    this.user = user;
    this.loadRules(this.abac);
  }

  loadRules(rules: Rules, context: Record<string, any> = {}) {
    const injectedRules = injectRules(rules, { user: this.user, ...context });
    this.rules = sortRules([...injectedRules, ...this.rules]);
    this.ability = new Ability(this.rules);
    return this.ability;
  }

  pullRoleFromSubject(subjectType: SubjectType, subject: Subject<Role>) {
    // Auto load 'default' role if defined, as it applies to everyone
    this.loadRole(DefaultRole as Role, subjectType, subject);

    // Auto assign "author" role for subjects created by the user
    const authorAssignedRole = this.subjects[subjectType]?.author?.assignRole;
    if (authorAssignedRole && subject.createdBy === this.user.id) {
      this.loadRole(authorAssignedRole, subjectType, subject);
      this.loadedSubjectRoles[`${subjectType}.${subject.id}`] =
        authorAssignedRole;
      return;
    }

    const { role: userRole } = subject.permissions?.[this.user.id] || {};
    if (userRole) {
      this.loadRole(userRole, subjectType, subject);
      // Keep this in memory in case a child subject might given policies to this role
      this.loadedSubjectRoles[`${subjectType}.${subject.id}`] = userRole;
    }

    const { role: publicRole } = subject.permissions?.[PublicAccess] || {};
    if (publicRole) {
      this.loadRole(publicRole, subjectType, subject);
    }

    // Handle permissions describing parentRole -> policies relation within a child object (i.e { "role:agent":  { "policies": { "read": true } } })
    const parentSubjectWithARole = getParentSubjectIds(
      this.subjectRelations,
      subjectType,
      subject
    ).find(
      ({ subjectType, subjectId }) =>
        this.loadedSubjectRoles[`${subjectType}.${subjectId}`]
    );
    const parentRole =
      this.loadedSubjectRoles[
        `${parentSubjectWithARole?.subjectType}.${parentSubjectWithARole?.subjectId}`
      ];
    const permissionsFromParentSubjectRole =
      parentRole && (subject.permissions || {})[`${RolePrefix}${parentRole}`];
    if (
      permissionsFromParentSubjectRole &&
      Object.keys(permissionsFromParentSubjectRole?.policies || {})
    ) {
      this.loadRole(
        {
          name: `${subjectType}.${subject.id}.${parentRole}` as any,
          rules: [
            {
              // Allow requested policies for this specific subject
              subject: subjectType,
              action: Object.entries(
                permissionsFromParentSubjectRole?.policies || {}
              )
                .filter(([, enabled]) => enabled)
                .map(([policy]) => policy),
              conditions: {
                id: subject.id!,
              },
            },
          ],
        },
        subjectType,
        subject
      );
    }
  }

  public getLoadedSubjectRole(subjectType: SubjectType, subjectId: string) {
    return this.loadedSubjectRoles[`${subjectType}.${subjectId}`];
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
    subject?: Subject<Role>,
    includeErrorSubject?: boolean
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
        throw new PrismeaiForbiddenError(
          `${error.message} ${(<any>subject).id || (<any>subject).slug}`,
          {
            action: error.action,
            subjectType: error.subjectType,
            id: (<any>subject).id,
            slug: (<any>subject).slug,
            subject: includeErrorSubject ? subject : undefined,
          }
        );
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
