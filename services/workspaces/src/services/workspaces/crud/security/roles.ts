// @ts-ignore
import { hri } from 'human-readable-ids';
import { AccessManager, Role, SubjectType } from '../../../../permissions';
import { CustomRole } from '@prisme.ai/permissions';
import { InvalidSecurity } from '../../../../errors';
import { getObjectsDifferences } from '../../../../utils/getObjectsDifferences';
import { logger } from '../../../../logger';
import {
  FIRST_CUSTOM_RULE_PRIORITY,
  LAST_CUSTOM_RULE_PRIORITY,
} from '../../../../../config';
import { validateUserRule } from './validateUserRule';

export class Roles {
  private accessManager: Required<AccessManager>;

  constructor(accessManager: Required<AccessManager>) {
    this.accessManager = accessManager;
  }

  private getRoleId(workspaceId: string, name: string) {
    return `workspaces/${workspaceId}/role/${name}`;
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
          ...validateUserRule(workspaceId, rule).map((cur) => ({
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

  public updateAuthorizations = async (
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
}
