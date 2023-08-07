import crypto from 'crypto';
import { Configuration } from 'oidc-provider';
const errors = require('fix-esm').require('oidc-provider').errors;
import { syscfg } from '.';
import { findCommonParentDomain } from '../utils/findCommonParentDomain';
import { getJWKS } from '../services/oidc/provider';
import path from 'path';
import { URL } from 'url';

const OIDC_STUDIO_CLIENT_ID =
  process.env.OIDC_STUDIO_CLIENT_ID || 'local-client-id';
const OIDC_STUDIO_CLIENT_SECRET =
  process.env.OIDC_STUDIO_CLIENT_SECRET || 'some-secret';

// PROVIDER_URL, STUDIO_URL and PAGES_HOST must share a same parent domain for cookies to be properly transmitted between login form & OIDC provider
const PAGES_HOST = process.env.PAGES_HOST || '.pages.local.prisme.ai:3100';
const PROVIDER_URL =
  process.env.OIDC_PROVIDER_URL || syscfg.API_URL.replace('/v2', '');
const STUDIO_URL = `${
  process.env.CONSOLE_URL || 'http://studio.local.prisme.ai:3000'
}`;
const LOGIN_PATH = '/signin';

const cookiesDomain = findCommonParentDomain([
  PAGES_HOST,
  PROVIDER_URL,
  STUDIO_URL,
]);
if (!cookiesDomain) {
  console.warn(
    `No shared parent domain found between pages host, OIDC provider url and studio login url. Authentication might not be working !`
  );
}

const OIDC_WELL_KNOWN_URL = process.env.OIDC_WELL_KNOWN_URL;

export const ResourceServer = syscfg.API_URL;
const resourceServers = {
  [ResourceServer]: {
    scope:
      'workspaces:write workspaces:read events:write events:read webhooks pages:read files:write files:read',
    audience: ResourceServer,
    accessTokenFormat: 'jwt',
  },
};

const SESSION_COOKIES_MAX_AGE = parseInt(
  process.env.SESSION_COOKIES_MAX_AGE || <any>(30 * 24 * 60 * 60)
);
const ACCESS_TOKENS_MAX_AGE = parseInt(
  process.env.ACCESS_TOKENS_MAX_AGE || <any>(30 * 24 * 60 * 60)
);

const JWKS_FILEPATH =
  process.env.JWKS_FILEPATH || path.resolve('../../jwks.json');

const OIDC_CLIENT_REGISTRATION_TOKEN =
  process.env.OIDC_CLIENT_REGISTRATION_TOKEN || 'oidc-client-registration';

const SESSION_COOKIES_SIGN_SECRET =
  process.env.SESSION_COOKIES_SIGN_SECRET || ',s6<Mt3=dE[7a#k{)4H)C4%';

export default {
  PROVIDER_URL,
  STUDIO_URL,
  LOGIN_PATH,
  OIDC_STUDIO_CLIENT_ID,
  OIDC_STUDIO_CLIENT_SECRET,
  PAGES_HOST, // Used to build login form url for workspace pages
  SESSION_COOKIES_MAX_AGE,
  ACCESS_TOKENS_MAX_AGE,
  OIDC_CLIENT_REGISTRATION_TOKEN,
  OIDC_WELL_KNOWN_URL,
  JWKS_URL: process.env.JWKS_URL || `${PROVIDER_URL}/oidc/jwks`,
  CONFIGURATION: <Configuration>{
    // Claims per scope
    claims: {
      profile: ['firstName', 'lastName', 'photo', 'language'],
      email: ['email'],
      settings: ['mfa', 'meta', 'authData'],
    },

    features: {
      // Enable client credentials grant type for machine to machine communication
      clientCredentials: {
        enabled: true,
      },
      introspection: {
        enabled: true,
      },
      userinfo: {
        enabled: true,
      },
      devInteractions: {
        enabled: false, // Set to false when finished
      },
      resourceIndicators: {
        enabled: true,

        /**
         * Function used to determine the default resource indicator for a request when none is provided by the client during the authorization request or when multiple are provided/resolved
         * Only a single resource server must be returned
         */
        defaultResource(ctx: any) {
          return Array.isArray(ctx.oidc.params?.resource) &&
            ctx.oidc.params?.resource?.length
            ? ctx.oidc.params?.resource[0]
            : ctx.oidc.params?.resource || ResourceServer;
        },
        useGrantedResource: async function useGrantedResource() {
          // Allows client to not explicitly providing resource parameter during auth requests
          return true;
        },
        /*
         * Function used to load information about a Resource Server (API) and check if the client is allowed this target RS scopes
         */
        getResourceServerInfo(
          ctx: any,
          resourceIndicator: string,
          client: any
        ) {
          if (!resourceIndicator || !resourceServers[resourceIndicator]) {
            throw new errors.InvalidRequest('Invalid resource server');
          }
          const targetResourceServer = resourceServers[resourceIndicator];
          if (
            !Array.isArray(client.allowedResources) ||
            !client.allowedResources.includes(resourceIndicator)
          ) {
            throw new errors.InvalidClientMetadata(
              'Please define mandatory options allowedResources and allowedResources within calling Client configuration'
            );
          }

          let clientAllowedScope: string[] = [];
          if (client.resourceScopes) {
            const scopesList = client.resourceScopes.split(' ') as string[];
            clientAllowedScope = scopesList.filter((scopeItem: string) => {
              return targetResourceServer.scope.includes(scopeItem);
            });
          } else {
            throw new errors.InvalidClientMetadata(
              'Please specify at least one scope within Client resourceScopes configuration'
            );
          }

          // Update allowed scopes within issued access token
          targetResourceServer.scope = clientAllowedScope.join(' ');
          return targetResourceServer;
        },
      },
      registration: {
        enabled: true,
        initialAccessToken: OIDC_CLIENT_REGISTRATION_TOKEN,
      },
      registrationManagement: {
        enabled: true,
      },
      rpInitiatedLogout: {
        enabled: true,
        async logoutSource(ctx, form) {
          const nonce = await crypto.randomBytes(16).toString('base64');

          // Custom JS to auto submit confirm form
          ctx.body = `<!DOCTYPE HTML>
            <head>
              <title>Logout</title>
              <meta http-equiv="content-security-policy"
               content="
                 script-src 'nonce-${nonce}' 'strict-dynamic' 'unsafe-inline';
                 default-src 'self';
              ">
            </head>
            <body>
              ${form}
              <script nonce="${nonce}">
                var form = document.forms[0];
                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'logout';
                input.value = 'yes';
                form.appendChild(input);
                form.submit();
              </script>
            </body>
          </html>`;
        },
      },
    },
    clients: [
      // Studio client
      {
        client_id: OIDC_STUDIO_CLIENT_ID,
        client_secret: OIDC_STUDIO_CLIENT_SECRET,
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        redirect_uris: [new URL(LOGIN_PATH, STUDIO_URL).toString()],
        token_endpoint_auth_method: 'none',
        allowedResources: [ResourceServer],
        resourceScopes:
          'workspaces:write workspaces:read events:write events:read webhooks pages:read files:write files:read',
        isInternalClient: true,
        post_logout_redirect_uris: [new URL(LOGIN_PATH, STUDIO_URL).toString()],
      },
    ],

    async extraTokenClaims(_: any, token: any) {
      return {
        prismeaiSessionId: token.sessionUid,
      };
    },

    extraClientMetadata: {
      /**
       * isInternalClient: true | false, wether the client is for first party or for third party
       *
       * resourceScopes: ressource scope clients is allowed to requested for
       *
       * allowedResources: ressource server client is allowed to request token for
       */
      properties: [
        'allowedResources',
        'resourceScopes',
        'isInternalClient',
        'workspaceSlug',
        'workspaceId',
      ],
      validator: function extraClientMetadataValidator() {},
    },

    // TODO regularly rotate
    jwks: getJWKS(JWKS_FILEPATH),

    // acrValues: ['session', 'urn:mace:incommon:iap:bronze'],
    cookies: {
      // https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#cookieskeys
      // Keygrip Signing keys used for cookie signing to prevent tampering.
      // Should be regularly rotated by adding new keys at the end & removing older ones
      keys: [SESSION_COOKIES_SIGN_SECRET],
      //   long: { signed: true, maxAge: (1 * 24 * 60 * 60) * 1000 }, // 1 day in ms
      short: {
        // signed: true
        httpOnly: true,
        overwrite: true,
        sameSite: 'lax',
        path: '/',
        domain: cookiesDomain,
      },

      long: {
        maxAge: SESSION_COOKIES_MAX_AGE * 1000,
        domain: cookiesDomain,
      },

      names: {
        interaction: '_interaction',
        resume: '_interaction_resume',
        session: '_session',
      },
    },

    ttl: {
      AccessToken: ACCESS_TOKENS_MAX_AGE,
      AuthorizationCode: 10 * 60, // 10 minutes in seconds
      ClientCredentials: 10 * 60, // 10 minutes in seconds
      IdToken: 1 * 60 * 60, // 1 hour in seconds
      RefreshToken: 1 * 24 * 60 * 60, // 1 day in seconds
    },
  },
};
