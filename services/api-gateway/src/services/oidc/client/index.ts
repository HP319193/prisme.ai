import { Broker } from '@prisme.ai/broker';
import { ClientMetadata } from 'oidc-provider';
import { EventType } from '../../../eda';
import { storage } from '../../../config';
import { ResourceServer } from '../../../config/oidc';
import { logger } from '../../../logger';
import { buildStorage } from '../../../storage';
import {
  createClient,
  deleteClient,
  getClient,
  initClient,
  updateClient,
} from './api';
import { URL } from 'url';

type OAuthClient = {
  subjectType: string;
  subjectId: string;
  clientId: string;
  clientName: string;
  redirectUris: string[];
  registrationAccessToken: string;
};
const OAuthClients = buildStorage<OAuthClient>('OAuthClient', storage.Users);

export default async function startWorkspacesClientSync(broker: Broker) {
  await initClient();
  logger.info(
    'Succesfully started workspaces client synchronization with OIDC provider.'
  );
  broker.on(
    [
      EventType.UpdatedWorkspace,
      EventType.CreatedWorkspace,
      EventType.DeletedWorkspace,
    ],
    async (event) => {
      try {
        if (event.type === EventType.CreatedWorkspace) {
          const { payload } = event as Prismeai.CreatedWorkspace;
          await createWorkspaceClient(broker, payload.workspace);
        } else if (event.type === EventType.UpdatedWorkspace) {
          const { payload } = event as Prismeai.UpdatedWorkspace;
          const client = await updateWorkspaceClient(broker, payload.workspace);
          // On migration, still emit update event to let microservices sync with this client
          if (
            client?.updated === false &&
            client.client_id &&
            payload.migrated === 'clientId'
          ) {
            emitClientId(broker, payload.workspace?.id!, client.client_id);
          }
        } else if (event.type === EventType.DeletedWorkspace) {
          const { payload } = event as Prismeai.DeletedWorkspace;
          await deleteWorkspaceClients(payload.workspaceId!);
        }
      } catch (err) {
        logger.warn({
          msg: 'Could not update OAuth2 workspace client !',
          err,
        });
      }
      return true;
    }
  );
}

async function createWorkspaceClient(
  broker: Broker,
  workspace: Prismeai.Workspace
) {
  const client = buildWorkspaceClient(workspace);
  const createdClient = await createClient(client);
  await saveOAuthClient(broker, workspace, createdClient);
  logger.info({
    msg: 'Succesfully created OAuth2 workspace client',
    workspaceID: workspace.id!,
    clientId: createdClient.client_id,
  });
  return createdClient;
}

const synchronizeClientFields = [
  'redirect_uris',
  'allowedResources',
  'workspaceSlug',
];
async function updateWorkspaceClient(
  broker: Broker,
  workspace: Prismeai.Workspace
): Promise<ClientMetadata & { updated?: boolean }> {
  const client = buildWorkspaceClient(workspace);
  const existingClients = await OAuthClients.find({
    subjectType: 'workspaces',
    subjectId: workspace.id!,
  });
  if (!existingClients?.length) {
    return await createWorkspaceClient(broker, workspace);
  }
  let existingClient: ClientMetadata;
  try {
    existingClient = await getClient(
      existingClients[0].clientId,
      existingClients[0].registrationAccessToken
    );
  } catch {
    // If we can't get this client from provider API, simply recreate it
    OAuthClients.delete({
      subjectType: 'workspaces',
      subjectId: workspace.id!,
    }).catch(() => {});
    logger.info({
      msg: 'Recreating OAuth2 workspace client as provider does not return any result with stored credentials',
      workspaceId: workspace.id,
      clientId: existingClients[0].clientId,
    });
    return await createWorkspaceClient(broker, workspace);
  }
  const someUpdatedField = synchronizeClientFields.some(
    (field) =>
      (existingClient[field] || '').toString() !=
      (client[field] || '').toString()
  );
  if (!someUpdatedField) {
    // Nothing changed
    logger.debug({
      msg:
        'Nothing changed on OAuth2 workspace client ' +
        existingClient.client_id,
    });
    existingClient.updated = false;
    return existingClient;
  }

  const updatedClient = await updateClient({
    ...client,
    client_id: existingClient.client_id,
    registration_access_token: existingClient.registration_access_token,
  });
  await saveOAuthClient(broker, workspace, updatedClient);

  logger.info({
    msg: 'Succesfully updated OAuth2 workspace client',
    workspaceID: workspace.id!,
    clientId: updatedClient.client_id,
  });
  return updatedClient;
}

async function emitClientId(
  broker: Broker,
  workspaceId: string,
  clientId: string
) {
  broker
    .send<Prismeai.UpdatedWorkspaceSecurity['payload']>(
      EventType.UpdatedWorkspaceSecurity,
      {
        security: {
          authentication: {
            clientId,
          },
        },
      },
      {
        workspaceId,
      }
    )
    .catch(logger.warn);
}

async function saveOAuthClient(
  broker: Broker,
  workspace: Prismeai.Workspace,
  client: ClientMetadata
) {
  emitClientId(broker, workspace.id!, client.client_id);
  return await OAuthClients.save(
    {
      subjectType: 'workspaces',
      subjectId: workspace.id!,
      clientId: client.client_id,
      clientName: workspace.name,
      redirectUris: client.redirect_uris || [],
      registrationAccessToken: client.registration_access_token as string,
    },
    {
      upsertQuery: {
        subjectType: 'workspaces',
        subjectId: workspace.id!,
      },
    }
  );
}

function buildWorkspaceClient(
  workspace: Prismeai.Workspace
): Omit<ClientMetadata, 'client_id'> {
  return {
    grant_types: ['authorization_code'],
    response_types: ['code'],
    redirect_uris: [
      `http://${workspace.slug!}.pages.local.prisme.ai:3100/signin`,
      ...(workspace.customDomains || []).map((cur) =>
        new URL('/signin', cur).toString()
      ),
    ],
    workspaceSlug: workspace.slug!,
    workspaceId: workspace.id,
    token_endpoint_auth_method: 'none',
    allowedResources: [ResourceServer],
    resourceScopes:
      'events:write events:read webhooks pages:read files:write files:read',
    isInternalClient: true,
  };
}

async function deleteWorkspaceClients(workspaceId: string) {
  const existingClients = await OAuthClients.find({
    subjectType: 'workspaces',
    subjectId: workspaceId,
  });

  for (let client of existingClients) {
    try {
      await deleteClient(client.clientId, client.registrationAccessToken);
      logger.info({
        msg: 'Succesfully deleted Workspace OAuth2 Client',
        workspaceID: workspaceId,
        clientId: client.clientId,
      });
    } catch (err) {
      logger.debug({
        msg: `Could not delete`,
      });
    }
  }

  await OAuthClients.delete({
    subjectType: 'workspaces',
    subjectId: workspaceId,
  });
}
