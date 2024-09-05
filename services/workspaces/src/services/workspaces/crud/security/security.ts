import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../../eda';
// @ts-ignore
import { hri } from 'human-readable-ids';
import { DSULType, DSULStorage } from '../../../DSULStorage';
import {
  AccessManager,
  ActionType,
  Role,
  SubjectType,
} from '../../../../permissions';
import { Roles } from './roles';

export class Security {
  private accessManager: Required<AccessManager>;
  private broker: Broker;
  private storage: DSULStorage<DSULType.Security>;

  private roles: Roles;

  constructor(
    accessManager: Required<AccessManager>,
    broker: Broker,
    workspacesStorage: DSULStorage
  ) {
    this.accessManager = accessManager;
    this.broker = broker;
    this.storage = workspacesStorage.child(DSULType.Security);

    this.roles = new Roles(accessManager);
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
      updatedSecurity.authorizations = await this.roles.updateAuthorizations(
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
}
