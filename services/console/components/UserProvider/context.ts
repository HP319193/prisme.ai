import { createContext, useContext } from 'react';
import { ApiError } from '@prisme.ai/sdk';

export interface UserContext<T = Prismeai.User | null> {
  user: T;
  loading: boolean;
  error?: ApiError;
  signin: (email: string, password: string) => Promise<Prismeai.User | null>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<Prismeai.User | null>;
  signout: () => void;
}

export const userContext = createContext<UserContext>({
  user: null,
  loading: false,
  signin: async () => null,
  signup: async () => null,
  signout() {},
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
