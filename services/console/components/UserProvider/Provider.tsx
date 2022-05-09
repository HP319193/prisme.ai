import { FC, useCallback, useEffect, useRef, useState } from 'react';
import context, { UserContext } from './context';
import api from '../../utils/api';
import { ApiError } from '@prisme.ai/sdk';
import { useRouter } from 'next/router';
import Storage from '../../utils/Storage';
import { Loading } from '@prisme.ai/design-system';

const REDIRECT_IF_SIGNED = ['/signin', '/signup', '/'];
const PUBLIC_URLS = ['/signin', '/signup', '/pages/[pageSlug]'];

export const UserProvider: FC = ({ children }) => {
  const [user, setUser] = useState<UserContext['user']>(null);
  const [loading, setLoading] = useState<UserContext['loading']>(true);
  const [error, setError] = useState<ApiError>();

  const { push, route } = useRouter();

  const signin: UserContext['signin'] = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { token, ...user } = await api.signin(email, password);
      api.token = token;
      Storage.set('auth-token', token);
      setError(undefined);
      setUser(user);
      setLoading(false);
      return user;
    } catch (e) {
      api.token = null;
      setUser(null);
      setLoading(false);
      setError(e as ApiError);
      return null;
    }
  }, []);

  const signup: UserContext['signup'] = useCallback(
    async (email, password, firstName, lastName) => {
      setLoading(true);
      try {
        const { token, ...user } = await api.signup(
          email,
          password,
          firstName,
          lastName
        );
        api.token = token;
        Storage.set('auth-token', token);
        setError(undefined);
        setUser(user);

        setLoading(false);
        return user;
      } catch (e) {
        const { error } = e as ApiError;
        if (error === 'AlreadyUsed') {
          // Try to log in
          try {
            const user = await signin(email, password);
            return user;
          } catch (e) {
            setError(e as ApiError);
          }
        }
        api.token = null;
        setUser(null);
        setLoading(false);
        setError(e as ApiError);
        return null;
      }
    },
    [signin]
  );

  const signout: UserContext['signout'] = useCallback(
    async (onServer: boolean = true) => {
      if (onServer) {
        try {
          api.signout();
        } catch {}
      }
      setUser(null);
      if (!PUBLIC_URLS.includes(route)) {
        push('/signin');
      }
    },
    [push, route]
  );

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const user = await api.me();
      setUser(user);
      setLoading(false);
      if (user.id && REDIRECT_IF_SIGNED.includes(route)) {
        push('/workspaces');
      }
      if (!user.id && !PUBLIC_URLS.includes(route)) {
        push('/signin');
      }
    } catch (e) {
      setError(e as ApiError);
      signout(false);
      setLoading(false);
    }
  }, [push, route, signout]);

  const initialFetch = useRef(fetchMe);

  useEffect(() => {
    initialFetch.current();
  }, []);

  if (!PUBLIC_URLS.includes(route) && loading) return <Loading />;

  if (error) {
    console.error(error);
  }

  return (
    <context.Provider value={{ user, loading, error, signin, signup, signout }}>
      {children}
    </context.Provider>
  );
};

export default UserProvider;
