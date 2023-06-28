import getConfig from 'next/config';
import { Api } from '@prisme.ai/sdk';
import Storage from '../../console/utils/Storage';

const { publicRuntimeConfig } = getConfig();
const api = new Api({
  host: publicRuntimeConfig.API_URL,
  oidc: {
    url: publicRuntimeConfig.OIDC_PROVIDER_URL,
    clientId: publicRuntimeConfig.OIDC_CLIENT_ID,
    pagesClientIdPrefix: publicRuntimeConfig.OIDC_PAGES_CLIENT_ID_PREFIX,
    pagesHost: publicRuntimeConfig.PAGES_HOST,
    redirectUri: new URL( // Also overridden for pages
      '/signin',
      publicRuntimeConfig.CONSOLE_URL || 'http://localhost:3000'
    ).toString(),
  },
});
api.token = Storage.get('access-token');
const legacyToken = Storage.get('auth-token');
if (!api.token && legacyToken) {
  api.legacyToken = legacyToken;
}

export * from '@prisme.ai/sdk';
export default api;
