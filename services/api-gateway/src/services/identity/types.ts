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
