import { SamlConfig } from '@node-saml/passport-saml';

export interface User extends Prismeai.User {
  resetPassword?:
    | {
        token: string;
        expiresAt: number;
      }
    | {};
  password?: string;
  validationToken?:
    | {
        token: string;
        expiresAt: number;
      }
    | {};
}

export interface OTPKey {
  method: Prismeai.SupportedMFA;
  secret: string;
  userId: string;
  period: number;
}

export type AccessToken = Prismeai.AccessToken;

export enum AuthProviders {
  Azure = 'azure',
}

export enum AuthProviderType {
  Oidc = 'oidc',
  Saml = 'saml',
}

export type OidcProviderConfig = {
  client_id: string;
  client_secret: string;
  authorization_endpoint: string;
  token_endpoint: string;
  scopes: string[];
  state?: boolean;
  jwks_uri: string;
};

export type SamlProviderConfig = {
  idp_metadata_filepath?: string;
} & Omit<SamlConfig, 'callbackUrl'>;

export type AuthProvidersConfig = {
  [name: string]: {
    type?: AuthProviderType;
    config: OidcProviderConfig | SamlProviderConfig;
    attributesMapping: Record<string, string>;
  };
};
