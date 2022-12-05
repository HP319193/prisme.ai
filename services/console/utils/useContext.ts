import { Context, useContext as useOriginalContext } from 'react';

export const useContext = <T>(context: Context<T | undefined>) => {
  const c = useOriginalContext(context);
  if (c === undefined) {
    throw new Error();
  }
  return c as T;
};
