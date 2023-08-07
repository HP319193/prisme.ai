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
import { CustomRole, Rule } from '@prisme.ai/permissions';
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
  'automations',
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

  // Validate user provided rules & scope them to the target workspace
  private validateUserRule(workspaceId: string, rule: Rule): Rule[] {
    const { action, subject, inverted, reason, conditions } = rule;
    const actions = Array.isArray(action) ? action : [action];
    const subjects = Array.isArray(subject) ? subject : [subject];

    // First validte subjects & actions
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

    // Then enforce workspace scoped conditions
    const ruleWithoutConditions = {
      action: actions,
      inverted,
      reason,
    };
    const rules: Rule[] = [];
    subjects.forEach((subject) => {
      if (subject === 'events') {
        const actionsWithoutCreate = actions.filter(
          (cur) => cur !== ActionType.Create
        );
        if (actionsWithoutCreate.length) {
          rules.push({
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
          rules.push({
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
          {
            [SubjectType.Workspace]: 'id',
            [SubjectType.App]: 'workspaceId',
            [SubjectType.File]: 'workspaceId',
            [SubjectType.Page]: 'workspaceId',
            ['automations']: 'runningWorkspaceId',
          }[subject as SubjectType] || 'workspaceId';

        rules.push({
          ...ruleWithoutConditions,
          subject,
          conditions: {
            ...conditions,
            [workspaceIdField]: workspaceId,
          },
        });
      }
    });

    return rules;
  }

  private buildRoles = (
    workspaceId: string,
    authorizations: Prismeai.WorkspaceAuthorizations
  ) => {
    const { editor: _, owner: __, ...roles } = authorizations?.roles || {};
    const initRoles = Object.entries(roles).reduce<
      Record<string, CustomRole<SubjectType>>
    >((initRoles, [roleName, role]) => {
      // Api Key value cannot be manually set
      if (role?.auth?.apiKey?.value) {
        delete role.auth.apiKey.value;
      }
      return {
        ...initRoles,
        [roleName]: {
          id: this.getRoleId(workspaceId, roleName),
          type: role?.auth?.apiKey ? 'apiKey' : 'role',
          name: roleName,
          subjectType: SubjectType.Workspace,
          subjectId: workspaceId,
          rules: [],
          auth: role.auth,
        },
      };
    }, {});

    const builtRoles = (authorizations?.rules || []).reduce<
      Record<string, CustomRole<SubjectType>>
    >((builtRoles, rule, ruleIdx) => {
      const attachedRoles = Array.isArray(rule.role)
        ? rule.role
        : [rule.role || 'default'];

      attachedRoles.forEach((roleName) => {
        if (roleName === Role.Owner) {
          throw new InvalidSecurity(
            `Reserved role '${roleName} cannot be overriden !'`
          );
        }
        // Check that referenced roles exist
        if (
          roleName !== 'default' &&
          !(roleName in (authorizations?.roles || {}))
        ) {
          throw new InvalidSecurity(
            `Unknown custom role '${roleName}' referenced in a rule`
          );
        }

        // Build native roles default, owner & editor only if explicitly used by rules
        if (!(roleName in builtRoles)) {
          builtRoles[roleName] = {
            id: this.getRoleId(workspaceId, roleName),
            type: 'role',
            name: roleName,
            subjectType: SubjectType.Workspace,
            subjectId: workspaceId,
            rules: [],
          };
        }

        // Validate & scope current rule, splitted if necessary
        builtRoles[roleName].rules.push(
          ...this.validateUserRule(workspaceId, rule).map((cur) => ({
            ...cur,
            priority:
              FIRST_CUSTOM_RULE_PRIORITY + ruleIdx < LAST_CUSTOM_RULE_PRIORITY
                ? FIRST_CUSTOM_RULE_PRIORITY + ruleIdx
                : LAST_CUSTOM_RULE_PRIORITY,
          }))
        );
      });

      return builtRoles;
    }, initRoles);

    return Object.values(builtRoles);
  };

  private updateAuthorizations = async (
    workspaceId: string,
    authorizations: Prismeai.WorkspaceAuthorizations
  ) => {
    // Build & validate roles
    const builtRoles = this.buildRoles(workspaceId, authorizations);

    // Compare new roles specs with current ones
    const currentRoles = (
      await this.accessManager.findRoles({
        subjectType: SubjectType.Workspace,
        subjectId: workspaceId,
      })
    ).filter((cur) => cur.id.startsWith(this.getRoleId(workspaceId, '')));
    const currentRolesMapping = currentRoles.reduce<
      Record<string, CustomRole<SubjectType>>
    >((mapping, { _id: _, __v: __, auth, ...role }: any) => {
      // Remove apiKeys value from the serialized role as they should not live in DSUL
      if (auth?.apiKey?.value) {
        const { value, ...apiKey } = auth.apiKey;
        role.auth = { ...auth, apiKey };
      } else if (auth) {
        role.auth = auth;
      }
      return {
        ...mapping,
        [role.id]: role,
      };
    }, {});
    const updatedRolesMapping = builtRoles.reduce<
      Record<string, CustomRole<SubjectType>>
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
      .map(([id]: any) => {
        // Re-inject apiKeys value, if any
        if (updatedRolesMapping[id]?.auth?.apiKey) {
          const previousApiKey = currentRoles.find((cur) => cur.id === id);
          if (previousApiKey && previousApiKey?.auth?.apiKey?.value) {
            updatedRolesMapping[id].auth = {
              ...updatedRolesMapping[id].auth,
              apiKey: {
                ...updatedRolesMapping[id].auth?.apiKey,
                value: previousApiKey?.auth?.apiKey?.value,
              },
            };
          }
        }
        return updatedRolesMapping[id];
      });
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
    return Object.entries(roles)
      .filter(
        ([_, role]: [string, Prismeai.WorkspaceRole]) => !role?.auth?.apiKey
      )
      .map(([name, role]) => ({
        name,
        description: (<any>role)?.description,
      }));
  };

  /**
   * API Keys
   */

  listApiKeys = async (workspaceId: string) => {
    const apiKeys = await this.accessManager.findApiKeys(
      SubjectType.Workspace,
      workspaceId
    );
    return apiKeys;
  };

  createApiKey = async (
    workspaceId: string,
    { name, rules }: PrismeaiAPI.CreateApiKey.RequestBody
  ) => {
    const validatedRules = rules.flatMap((rule) =>
      this.validateUserRule(workspaceId, rule)
    );
    const apiKey = await this.accessManager.createApiKey(
      SubjectType.Workspace,
      workspaceId,
      { name, rules: validatedRules as Prismeai.PermissionRule[] }
    );

    this.broker.send<Prismeai.CreatedApiKey['payload']>(
      EventType.CreatedApiKey,
      <Prismeai.CreatedApiKey['payload']>apiKey
    );

    return apiKey;
  };

  updateApiKey = async (
    workspaceId: string,
    apiKey: string,
    { name, rules }: PrismeaiAPI.CreateApiKey.RequestBody
  ) => {
    const validatedRules = rules.flatMap((rule) =>
      this.validateUserRule(workspaceId, rule)
    );
    const updatedApiKey = await this.accessManager.updateApiKey(
      apiKey,
      SubjectType.Workspace,
      workspaceId,
      { name, rules: validatedRules as Prismeai.PermissionRule[] }
    );

    this.broker.send<Prismeai.UpdatedApiKey['payload']>(
      EventType.UpdatedApiKey,
      <Prismeai.UpdatedApiKey['payload']>updatedApiKey
    );

    return updatedApiKey;
  };

  deleteApiKey = async (workspaceId: string, apiKey: string) => {
    await this.accessManager.deleteApiKey(
      apiKey,
      SubjectType.Workspace,
      workspaceId
    );

    this.broker.send<Prismeai.DeletedApiKey['payload']>(
      EventType.DeletedApiKey,
      {
        apiKey,
        subjectType: SubjectType.Workspace,
        subjectId: workspaceId,
      }
    );
  };
}

export default Security;
