import { createContext, useContext } from 'react';
import { ApiError } from '@prisme.ai/sdk';

export enum OperationSuccess {
  emailSent = 'emailSent',
  passwordReset = 'passwordReset',
  mailValidated = 'mailValidated',
  signupSuccess = 'signupsuccess',
}

export interface ApiSuccess {
  type: OperationSuccess;
}
export interface UserContext<
  T = (Prismeai.User & { sessionId?: string }) | null
> {
  user: T;
  loading: boolean;
  error?: ApiError;
  success?: ApiSuccess;
  signin: (email: string, password: string) => Promise<boolean>;
  initAuthentication: (options?: {
    redirect?: string;
    signup?: true;
  }) => Promise<string>;
  completeAuthentication: (authorizationCode: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    language: string
  ) => Promise<Prismeai.User | null>;
  signout: (clearOpSession?: boolean) => void;
  sendPasswordResetMail: (email: string, language: string) => Promise<any>;
  passwordReset: (token: string, password: string) => Promise<any>;
  sendValidationMail: (email: string, language: string) => Promise<any>;
  validateMail: (token: string) => Promise<any>;
}

export const userContext = createContext<UserContext>({
  user: null,
  loading: false,
  signin: async () => false,
  initAuthentication: () => Promise.resolve('url'),
  completeAuthentication: async () => {},
  signup: async () => null,
  signout() {},
  sendPasswordResetMail: async () => null,
  passwordReset: async () => null,
  sendValidationMail: async () => null,
  validateMail: async () => null,
});

export function useUser(throwIfNotExist?: boolean): UserContext;
export function useUser(
  throwIfNotExist?: true
): UserContext<Prismeai.User & { sessionId?: string }>;
export function useUser(throwIfNotExist?: boolean) {
  const context = useContext(userContext);

  if (throwIfNotExist && !context.user) {
    throw new Error();
  }

  return context;
}

export default userContext;
