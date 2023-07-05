import { ClientMetadata } from 'oidc-provider';
import fetch from 'node-fetch';
import { oidcCfg } from '../../../config';
import { ConfigurationError } from '../../../types/errors';

let openidConfiguration: { registration_endpoint: string };
export async function initClient() {
  try {
    openidConfiguration = await fetchProvider(oidcCfg.OIDC_WELL_KNOWN_URL, {
      method: 'GET',
    });
  } catch (err) {
    throw new ConfigurationError(
      `Could not fetch OIDC_WELL_KNOWN_URL endpoint, required for OAuth2 clients synchronization.`,
      {
        err,
        msg: `Could not fetch OIDC_WELL_KNOWN_URL endpoint, required for OAuth2 clients synchronization.`,
      }
    );
  }
}

export async function updateClient(
  client: ClientMetadata
): Promise<ClientMetadata> {
  const { registration_access_token, ...metadata } = client;
  return await fetchProvider(
    openidConfiguration.registration_endpoint + `/${client.client_id}`,
    {
      method: 'PUT',
      body: metadata,
      headers: {
        Authorization: `Bearer ${registration_access_token}`,
      },
    }
  );
}

export async function deleteClient(
  clientId: string,
  registrationAccessToken: string
): Promise<void> {
  return await fetchProvider(
    openidConfiguration.registration_endpoint + `/${clientId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${registrationAccessToken}`,
      },
    }
  );
}

export async function getClient(
  clientId: string,
  registrationAccessToken: string
): Promise<ClientMetadata> {
  return await fetchProvider(
    openidConfiguration.registration_endpoint + `/${clientId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${registrationAccessToken}`,
      },
    }
  );
}

export async function createClient(
  client: Omit<ClientMetadata, 'client_id'>
): Promise<ClientMetadata> {
  return await fetchProvider(openidConfiguration.registration_endpoint, {
    method: 'POST',
    body: client,
    headers: {
      Authorization: `Bearer ${oidcCfg.OIDC_CLIENT_REGISTRATION_TOKEN}`,
    },
  });
}

export async function fetchProvider(
  url: string,
  { method, body, headers }: { method: string; body?: any; headers?: any }
) {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (res.status >= 400 && res.status < 600) {
    throw json;
  }
  return json;
}
