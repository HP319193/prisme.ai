import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../eda';
// @ts-ignore
import { hri } from 'human-readable-ids';
import { DSULType, DSULStorage } from '../../DSULStorage';
import {
  AccessManager,
  ActionType,
  Role,
  SubjectType,
} from '../../../permissions';
import { CustomRole } from '@prisme.ai/permissions';
import { InvalidSecurity } from '../../../errors';
import { getObjectsDifferences } from '../../../utils/getObjectsDifferences';
import { logger } from '../../../logger';
import {
  FIRST_CUSTOM_RULE_PRIORITY,
  LAST_CUSTOM_RULE_PRIORITY,
} from '../../../../config';

const OnlyAllowedSubjects = [
  SubjectType.Workspace,
  SubjectType.Page,
  SubjectType.File,
  SubjectType.App,
  'events',
];
const OnlyAllowedActions = Object.values(ActionType);

class Security {
  private accessManager: Required<AccessManager>;
  private broker: Broker;
  private storage: DSULStorage<DSULType.Security>;

  constructor(
    accessManager: Required<AccessManager>,
    broker: Broker,
    workspacesStorage: DSULStorage
  ) {
    this.accessManager = accessManager;
    this.broker = broker;
    this.storage = workspacesStorage.child(DSULType.Security);
  }

  // private validateSchedules(schedules: Prismeai.When['schedules'] = []) {
  //   for (const schedule of schedules) {
  //     try {
  //       // Only verify if it is a well formatted cron
  //       parseCron(schedule);
  //     } catch (e) {
  //       throw new InvalidScheduleError(undefined, e);
  //     }
  //   }
  // }

  getSecurity = async (workspaceId: string) => {
    await this.accessManager.throwUnlessCan(
      ActionType.Read,
      SubjectType.Workspace,
      workspaceId
    );
    try {
      const security = await this.storage.get({ workspaceId });
      return security;
    } catch {
      return {};
    }
  };

  private getRoleId(workspaceId: string, name: string) {
    return `workspaces/${workspaceId}/role/${name}`;
  }

  private buildRoles = (
    workspaceId: string,
    authorizations: Prismeai.WorkspaceAuthorizations
  ) => {
    const builtRoles = (authorizations?.rules || []).reduce<
      Record<string, CustomRole<SubjectType, any>>
    >(
      (
        builtRoles,
        { role: attachedRole, action, subject, inverted, reason, conditions },
        ruleIdx
      ) => {
        const attachedRoles = Array.isArray(attachedRole)
          ? attachedRole
          : [attachedRole || 'default'];
        const actions = Array.isArray(action) ? action : [action];
        const subjects = Array.isArray(subject) ? subject : [subject];

        if (
          !subjects.length ||
          subjects.some(
            (subject) => !OnlyAllowedSubjects.includes(subject as SubjectType)
          )
        ) {
          throw new InvalidSecurity(
            `Forbidden subjectType '${subject}' found in security rules`
          );
        }
        if (
          !actions.length ||
          actions.some(
            (action) => !OnlyAllowedActions.includes(action as SubjectType)
          )
        ) {
          throw new InvalidSecurity(
            `Forbidden actionType '${action}' found in security rules`
          );
        }

        attachedRoles.forEach((roleName) => {
          if (roleName === Role.Owner) {
            throw new InvalidSecurity(
              `Reserved role '${roleName} cannot be overriden !'`
            );
          } else if (
            roleName !== 'default' &&
            !(roleName in (authorizations?.roles || {}))
          ) {
            throw new InvalidSecurity(
              `Unknown custom role '${roleName}' referenced in a rule`
            );
          }

          if (!(roleName in builtRoles)) {
            builtRoles[roleName] = {
              id: this.getRoleId(workspaceId, roleName),
              type: 'casl',
              name: roleName,
              subjectType: SubjectType.Workspace,
              subjectId: workspaceId,
              rules: [],
              casl: [],
            };
          }

          const ruleWithoutConditions = {
            action: actions,
            inverted,
            reason,
            priority:
              FIRST_CUSTOM_RULE_PRIORITY + ruleIdx < LAST_CUSTOM_RULE_PRIORITY
                ? FIRST_CUSTOM_RULE_PRIORITY + ruleIdx
                : LAST_CUSTOM_RULE_PRIORITY,
          };
          subjects.forEach((subject) => {
            if (subject === 'events') {
              const actionsWithoutCreate = actions.filter(
                (cur) => cur !== ActionType.Create
              );
              if (actionsWithoutCreate.length) {
                builtRoles[roleName].casl?.push({
                  ...ruleWithoutConditions,
                  subject: 'events',
                  action: actionsWithoutCreate,
                  conditions: {
                    ...conditions,
                    'source.workspaceId': workspaceId,
                  },
                });
              }
              // Create specific conditions : No one but the platform should be able to emit native events
              if (actionsWithoutCreate.length !== actions.length) {
                builtRoles[roleName].casl?.push({
                  ...ruleWithoutConditions,
                  subject: 'events',
                  action: 'create',
                  conditions: {
                    ...conditions,
                    'source.workspaceId': workspaceId,
                    'source.serviceTopic': 'topic:runtime:emit',
                  },
                });
              }
            } else {
              const workspaceIdField =
                subject === SubjectType.Workspace ? 'id' : 'workspaceId';
              builtRoles[roleName].casl?.push({
                ...ruleWithoutConditions,
                subject,
                conditions: {
                  ...conditions,
                  [workspaceIdField]: workspaceId,
                },
              });
            }
          });
        });
        return builtRoles;
      },
      {}
    );

    return Object.values(builtRoles);
  };

  private updateAuthorizations = async (
    workspaceId: string,
    authorizations: Prismeai.WorkspaceAuthorizations
  ) => {
    // Build & validate roles
    const builtRoles = this.buildRoles(workspaceId, authorizations);

    // Compare new roles specs with current ones
    const currentRoles = await this.accessManager.findRoles(
      SubjectType.Workspace,
      workspaceId
    );
    const currentRolesMapping = currentRoles
      .filter((cur) => cur.type === 'casl')
      .reduce<Record<string, CustomRole<SubjectType, any>>>(
        (mapping, { _id: _, __v: __, ...role }: any) => ({
          ...mapping,
          [role.id]: role,
        }),
        {}
      );
    const updatedRolesMapping = builtRoles.reduce<
      Record<string, CustomRole<SubjectType, any>>
    >(
      (mapping, role) => ({
        ...mapping,
        [role.id]: role,
      }),
      {}
    );
    const diffs = getObjectsDifferences(
      currentRolesMapping,
      updatedRolesMapping
    );

    const rolesToUpdate = Object.entries(diffs.data)
      .filter(
        ([_, diff]: any) =>
          diff.__type === 'updated' || diff.__type === 'created'
      )
      .map(([id]: any) => updatedRolesMapping[id]);
    const rolesToDelete = Object.entries(diffs.data)
      .filter(([_, diff]: any) => diff.__type === 'deleted')
      .map(([id]: any) => currentRolesMapping[id]);

    // Check that deleted roles are not in used
    const workspace = await this.accessManager.get(
      SubjectType.Workspace,
      workspaceId
    );
    const sharedRoles = Object.values(workspace.permissions || {}).map(
      (cur) => cur?.role
    );
    const cantDeleteThatRole = rolesToDelete.find(
      (cur) => sharedRoles.includes(cur.name) && cur.name !== 'editor'
    );
    if (cantDeleteThatRole) {
      throw new InvalidSecurity(
        `Can't delete ${cantDeleteThatRole.name} role as it is still assigned to some user in your workspace`
      );
    }

    // Separate update & delete queries
    const savedRoles = rolesToUpdate.map((role) =>
      this.accessManager.saveRole(role).then(() => true)
    );
    const deletedRoles = rolesToDelete.map((role) =>
      this.accessManager.deleteRole(role.id)
    );

    await Promise.all(savedRoles.concat(deletedRoles));
    logger.info({
      msg: `Workspace ${workspaceId} updated ${savedRoles.length} roles and deleted ${rolesToDelete.length} others`,
      updatedRoles: rolesToUpdate.map((cur) => cur.id),
      deletedRoles: rolesToDelete.map((cur) => cur.id),
    });

    return authorizations;
  };

  updateSecurity = async (
    workspaceId: string,
    security: Prismeai.WorkspaceSecurity
  ) => {
    await this.accessManager.throwUnlessCan(
      ActionType.ManageSecurity,
      SubjectType.Workspace,
      workspaceId
    );

    const updatedSecurity = { ...security };
    if (updatedSecurity.authorizations) {
      updatedSecurity.authorizations = await this.updateAuthorizations(
        workspaceId,
        updatedSecurity.authorizations
      );
    }
    await this.storage.save({ workspaceId }, updatedSecurity, {
      mode: 'replace',
    });
    this.broker.send<Prismeai.UpdatedWorkspaceSecurity['payload']>(
      EventType.UpdatedWorkspaceSecurity,
      {
        security: updatedSecurity,
      },
      {
        workspaceId,
      }
    );
    return updatedSecurity;
  };

  getRoles = async (workspaceId: string) => {
    const security = await this.getSecurity(workspaceId);
    await this.accessManager.throwUnlessCan(
      ActionType.ManagePermissions,
      SubjectType.Workspace,
      workspaceId
    );
    const roles = {
      [Role.Owner]: {},
      [Role.Editor]: {},
      ...security?.authorizations?.roles,
    };
    return Object.entries(roles).map(([name, role]) => ({
      name,
      description: (<any>role)?.description,
    }));
  };
}

export default Security;
