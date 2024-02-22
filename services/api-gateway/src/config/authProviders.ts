import yaml from 'js-yaml';
import fs from 'fs';

/**
 * Generic OAuth
 */

import { AuthProvidersConfig } from '../services/identity';
import { syscfg } from '.';
import { logger } from '../logger';

let oauthProviders: AuthProvidersConfig = {};
try {
  const raw = fs.readFileSync(syscfg.AUTH_PROVIDERS_CONFIG, 'utf8');
  const oauth = yaml.load(raw) as { providers: AuthProvidersConfig };
  if (!oauth?.providers) {
    throw new Error(
      'Empty or misconfigured auth providers config at ' +
        syscfg.AUTH_PROVIDERS_CONFIG
    );
  }
  oauthProviders = oauth.providers as AuthProvidersConfig;
  for (let [name, provider] of Object.entries(oauthProviders || {})) {
    if (typeof provider.config?.scopes === 'undefined') {
      provider.config.scopes = ['openid', 'email'];
    } else if (typeof provider.config.scopes === 'string') {
      provider.config.scopes = (provider.config.scopes as string).split(' ');
    }

    const requiredParams = [
      'client_id',
      'client_secret',
      'authorization_endpoint',
      'token_endpoint',
      'jwks_uri',
    ];
    const missingParam = requiredParams.find(
      (cur) => typeof (<any>provider.config)[cur] !== 'string'
    );
    if (missingParam) {
      delete oauthProviders[name];
      logger.warn({
        msg: `Could not load '${name}' auth provider config as it is missing at least '${missingParam}' parameter`,
      });
    }
  }
} catch (err) {
  logger.warn({
    msg: `Could not load auth providers config at ${syscfg.AUTH_PROVIDERS_CONFIG}`,
    err,
  });
}

/**
 * Azure
 */
const msalCredentials = {
  cloudInstanceId: process.env.AZURE_AD_CLOUD_INSTANCE_ID,
  tenant: process.env.AZURE_AD_TENANT,
  clientId: process.env.AZURE_AD_APP_ID,
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
};
const msal = {
  auth: {
    ...msalCredentials,
    authority:
      (msalCredentials.cloudInstanceId || '') + (msalCredentials.tenant || ''),
  },
};

export default {
  oauth: oauthProviders,
  msal,
};
