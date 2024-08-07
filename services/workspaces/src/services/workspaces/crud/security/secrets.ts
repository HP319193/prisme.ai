// @ts-ignore
import { hri } from 'human-readable-ids';
import { AccessManager, SubjectType } from '../../../../permissions';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../../eda';

export class Secrets {
  private accessManager: Required<AccessManager>;
  private broker: Broker;

  constructor(accessManager: Required<AccessManager>, broker: Broker) {
    this.accessManager = accessManager;
    this.broker = broker;
  }

  /**
   * API Keys
   */

  getSecrets = async (workspaceId: string) => {
    const apiKeys = await this.accessManager.findApiKeys(
      SubjectType.Workspace,
      workspaceId
    );
    return apiKeys;
  };

  updateSecrets = async (
    workspaceId: string,
    secrets: PrismeaiAPI.UpdateWorkspaceSecrets.RequestBody
  ) => {
    return secrets;
  };
}
