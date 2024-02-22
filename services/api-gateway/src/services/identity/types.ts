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

export type AuthProvidersConfig = {
  [name: string]: {
    type?: 'oidc';
    config: {
      client_id: string;
      client_secret: string;
      authorization_endpoint: string;
      token_endpoint: string;
      scopes: string[];
      state?: boolean;
      jwks_uri: string;
    };
  };
};
