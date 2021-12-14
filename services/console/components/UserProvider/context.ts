import { createContext, useContext } from "react";
import { User } from "@prisme.ai/types";
import ApiError from "../../api/ApiError";

export interface UserContext<T = User | null> {
  user: T;
  loading: boolean;
  error?: ApiError;
  signin: (email: string, password: string) => Promise<User | null>;
  signout: () => void;
}

export const userContext = createContext<UserContext>({
  user: null,
  loading: false,
  signin: async () => null,
  signout() {},
});

export function useUser(throwIfNotExist?: boolean): UserContext;
export function useUser(throwIfNotExist?: true): UserContext<User>;
export function useUser(throwIfNotExist?: boolean) {
  const context = useContext(userContext);

  if (throwIfNotExist && !context.user) {
    throw new Error();
  }

  return context;
}

export default userContext;
