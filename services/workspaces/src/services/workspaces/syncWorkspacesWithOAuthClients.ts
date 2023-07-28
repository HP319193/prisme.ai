import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../eda';
import { logger } from '../../logger';
import {
  getSuperAdmin,
  AccessManager,
  SubjectType,
  WorkspaceMetadata,
} from '../../permissions';
import { ObjectNotFoundError } from '../../errors';

class OAuthClientCache {
  private clientIdsByWorkspaceSlug: Record<string, string>;
  private accessManager: Required<AccessManager>;

  constructor(accessManager: Required<AccessManager>) {
    this.clientIdsByWorkspaceSlug = {};
    this.accessManager = accessManager;
  }

  async setClientId(workspaceId: string, clientId: string) {
    const workspace = await this.accessManager.get(
      SubjectType.Workspace,
      workspaceId
    );
    this.clientIdsByWorkspaceSlug[workspace.slug] = clientId;
  }

  async getClientId(workspaceSlug: string) {
    if (this.clientIdsByWorkspaceSlug[workspaceSlug]) {
      return this.clientIdsByWorkspaceSlug[workspaceSlug];
    }
    let workspace: WorkspaceMetadata;
    // Handle custom domains
    if (workspaceSlug.includes('.')) {
      const customDomain = workspaceSlug.includes(':')
        ? workspaceSlug.slice(0, workspaceSlug.indexOf(':'))
        : workspaceSlug;
      workspace = await this.accessManager.get(SubjectType.Workspace, {
        customDomains: {
          $in: [customDomain, workspaceSlug],
        },
      });
    } else {
      workspace = await this.accessManager.get(SubjectType.Workspace, {
        slug: workspaceSlug,
      });
    }
    if (!workspace.clientId) {
      throw new ObjectNotFoundError(`This workspace hasn't any clientId.`);
    }
    // Index with workspaceSlug and not workspace.slug to keep custom domains cached !
    this.clientIdsByWorkspaceSlug[workspaceSlug] = workspace.clientId;
    return this.clientIdsByWorkspaceSlug[workspaceSlug];
  }
}
let clientIds: OAuthClientCache;

export async function initOAuthClientsSyncing(
  accessManager: AccessManager,
  broker: Broker
) {
  const superAdmin = await getSuperAdmin(accessManager);
  clientIds = new OAuthClientCache(superAdmin);

  broker.on<Prismeai.UpdatedWorkspaceSecurity['payload']>(
    EventType.UpdatedWorkspaceSecurity,
    async (event) => {
      if (
        !event?.source?.workspaceId ||
        !event?.payload?.security?.authentication?.clientId
      ) {
        return true;
      }
      try {
        await superAdmin.update(SubjectType.Workspace, {
          id: event.source.workspaceId,
          clientId: event?.payload?.security?.authentication?.clientId,
        });
        logger.info({
          msg: `Succesfully synced workspace with its new OAuth clientId`,
          clientId: event?.payload?.security?.authentication?.clientId,
          workspaceId: event.source.workspaceId,
        });
      } catch (err) {
        logger.warn({
          msg: `Could not sync workspace with its new OAuth clientId`,
          clientId: event?.payload?.security?.authentication?.clientId,
          workspaceId: event.source.workspaceId,
        });
      }
      return true;
    },
    {}
  );

  broker.on<Prismeai.UpdatedWorkspaceSecurity['payload']>(
    EventType.UpdatedWorkspaceSecurity,
    async (event) => {
      if (
        !event?.source?.workspaceId ||
        !event?.payload?.security?.authentication?.clientId
      ) {
        return true;
      }
      clientIds.setClientId(
        event.source.workspaceId,
        event.payload.security.authentication.clientId
      );
      return true;
    },
    {
      GroupPartitions: false, // Update all instances cache
    }
  );
}

export async function getWorkspaceClientId(workspaceSlug: string) {
  if (!clientIds) {
    return;
  }
  try {
    return await clientIds.getClientId(workspaceSlug);
  } catch (err) {
    logger.warn({
      msg: `Could not obtain workspace clientId`,
      workspaceSlug,
      err,
    });
    return;
  }
}
