// @ts-ignore
import { hri } from 'human-readable-ids';
import { AccessManager, SubjectType } from '../../../../permissions';
import { validateUserRule } from './validateUserRule';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../../eda';

export class ApiKeys {
  private accessManager: Required<AccessManager>;
  private broker: Broker;

  constructor(accessManager: Required<AccessManager>, broker: Broker) {
    this.accessManager = accessManager;
    this.broker = broker;
  }

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
      validateUserRule(workspaceId, rule)
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
      validateUserRule(workspaceId, rule)
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
