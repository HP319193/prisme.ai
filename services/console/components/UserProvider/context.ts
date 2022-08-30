import { createContext, useContext } from 'react';
import { ApiError } from '@prisme.ai/sdk';

export enum OperationSuccess {
  emailSent = 'emailSent',
  passwordReset = 'passwordReset',
}

export interface ApiSuccess {
  type: OperationSuccess;
}
export interface UserContext<T = Prismeai.User | null> {
  user: T;
  loading: boolean;
  error?: ApiError;
  success?: ApiSuccess;
  signin: (email: string, password: string) => Promise<Prismeai.User | null>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<Prismeai.User | null>;
  signout: (onServer?: boolean) => void;
  sendPasswordResetMail: (email: string, language: string) => Promise<any>;
  passwordReset: (token: string, password: string) => Promise<any>;
}

export const userContext = createContext<UserContext>({
  user: null,
  loading: false,
  signin: async () => null,
  signup: async () => null,
  signout() {},
  sendPasswordResetMail: async () => null,
  passwordReset: async () => null,
});

export function useUser(throwIfNotExist?: boolean): UserContext;
export function useUser(throwIfNotExist?: true): UserContext<Prismeai.User>;
export function useUser(throwIfNotExist?: boolean) {
  const context = useContext(userContext);

  if (throwIfNotExist && !context.user) {
    throw new Error();
  }

  return context;
}

export default userContext;
