import yaml from 'js-yaml';
import fs from 'fs';
import { MetadataReader, toPassportConfig } from 'passport-saml-metadata';

/**
 * Generic OAuth
 */

import {
  AuthProvidersConfig,
  OidcProviderConfig,
  SamlProviderConfig,
} from '../services/identity';
import { syscfg } from '.';
import { logger } from '../logger';

let authProviders: AuthProvidersConfig = {};
try {
  const raw = fs.readFileSync(syscfg.AUTH_PROVIDERS_CONFIG, 'utf8');
  const oauth = yaml.load(raw) as { providers: AuthProvidersConfig };
  if (!oauth?.providers) {
    throw new Error(
      'Empty or misconfigured auth providers config at ' +
        syscfg.AUTH_PROVIDERS_CONFIG
    );
  }
  authProviders = oauth.providers as AuthProvidersConfig;
  for (let [name, provider] of Object.entries(authProviders || {})) {
    if (provider.type === 'oidc') {
      validateOidcConfig(name, authProviders);
    } else if (provider.type === 'saml') {
      validateSamlConfig(name, authProviders);
    }
  }
} catch (err) {
  logger.warn({
    msg: `Could not load auth providers config at ${syscfg.AUTH_PROVIDERS_CONFIG}`,
    err,
  });
}

function validateSamlConfig(name: string, authProviders: AuthProvidersConfig) {
  try {
    const { idp_metadata_filepath: xmlFilepath, ...config } = ((
      authProviders[name] || {}
    )?.config || {}) as SamlProviderConfig;
    if (xmlFilepath) {
      const raw = fs.readFileSync(xmlFilepath, 'utf8');
      const parsedXml = toPassportConfig(new MetadataReader(raw));
      authProviders[name].config = {
        ...parsedXml,
        ...config,
      };
      console.log('===> ', authProviders[name].config);
    }
  } catch (err) {
    delete authProviders[name];
    logger.warn({
      msg: `Could not load '${name}' SAML auth provider`,
      err,
    });
  }
}

function validateOidcConfig(name: string, authProviders: AuthProvidersConfig) {
  const config = (authProviders[name] || {})?.config as OidcProviderConfig;
  if (typeof config?.scopes === 'undefined') {
    config.scopes = ['openid', 'email'];
  } else if (typeof config.scopes === 'string') {
    config.scopes = (config.scopes as string).split(' ');
  }

  const requiredParams = [
    'client_id',
    'client_secret',
    'authorization_endpoint',
    'token_endpoint',
    'jwks_uri',
  ];
  const missingParam = requiredParams.find(
    (cur) => typeof (<any>config)[cur] !== 'string'
  );
  if (missingParam) {
    delete authProviders[name];
    logger.warn({
      msg: `Could not load '${name}' auth provider config as it is missing at least '${missingParam}' parameter`,
    });
  }
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
  providers: authProviders,
  msal,
};
