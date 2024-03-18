import getConfig from 'next/config';
import { Api } from '@prisme.ai/sdk';
import Storage from './Storage';

const { publicRuntimeConfig } = getConfig();

function getRedirectURI() {
  try {
    return new URL(
      '/signin',
      publicRuntimeConfig.CONSOLE_URL || 'http://localhost:3000'
    ).toString();
  } catch {
    return '';
  }
}
const api = new Api({
  host: publicRuntimeConfig.API_URL,
  oidc: {
    url: publicRuntimeConfig.OIDC_PROVIDER_URL,
    clientId: publicRuntimeConfig.OIDC_STUDIO_CLIENT_ID,
    clientIdHeader: publicRuntimeConfig.OIDC_CLIENT_ID_HEADER,
    redirectUri: getRedirectURI(),
  },
});
api.token = Storage.get('access-token');
const legacyToken = Storage.get('auth-token');
if (!api.token && legacyToken) {
  api.legacyToken = legacyToken;
}

export * from '@prisme.ai/sdk';
export default api;
