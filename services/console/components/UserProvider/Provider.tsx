import { FC, useCallback, useEffect, useRef, useState } from 'react';
import context, { OperationSuccess, UserContext } from './context';
import api from '../../utils/api';
import { ApiError } from '@prisme.ai/sdk';
import { useRouter } from 'next/router';
import Storage from '../../utils/Storage';
import { Loading } from '@prisme.ai/design-system';

const REDIRECT_IF_SIGNED = ['/forgot', '/signin', '/signup', '/'];
const PUBLIC_URLS = ['/forgot', '/signin', '/signup', '/pages/[pageSlug]'];

interface UserProviderProps {
  anonymous?: boolean;
}

export const UserProvider: FC<UserProviderProps> = ({
  anonymous,
  children,
}) => {
  const [user, setUser] = useState<UserContext['user']>(null);
  const [loading, setLoading] = useState<UserContext['loading']>(true);
  const [error, setError] = useState<ApiError>();
  const [success, setSuccess] = useState<any>();

  const { push, route } = useRouter();

  const sendPasswordResetMail: UserContext['sendPasswordResetMail'] = useCallback(
    async (email: string, language: string) => {
      setLoading(true);
      try {
        await api.sendPasswordResetMail(email, language);
        setError(undefined);
        setSuccess({ type: OperationSuccess.emailSent });
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setError(e as ApiError);
        return null;
      }
    },
    []
  );

  const passwordReset: UserContext['passwordReset'] = useCallback(
    async (token: string, password: string) => {
      setLoading(true);
      try {
        await api.passwordReset(token, password);
        setError(undefined);
        setSuccess({ type: OperationSuccess.passwordReset });
        setLoading(false);
        setTimeout(() => push('/signin'), 3000);
      } catch (e) {
        setLoading(false);
        setError(e as ApiError);
        return null;
      }
    },
    [push]
  );

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
    async (email, password, firstName, lastName, language) => {
      setLoading(true);
      try {
        const { token, ...user } = await api.signup(
          email,
          password,
          firstName,
          lastName,
          language
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
    setError(undefined);
    try {
      const user = await api.me();
      if (user.authData && user.authData.anonymous && !anonymous) {
        throw {
          message: 'Anonymous user not allowed',
          error: 'AnonymousNotAllowed',
        };
      }
      if (!user) {
        throw { message: 'No user found', error: 'NoUserFound' };
      }
      setUser(user);
      setLoading(false);
      if (user.id && REDIRECT_IF_SIGNED.includes(route)) {
        push('/workspaces');
      }
      if (!user.id && !PUBLIC_URLS.includes(route)) {
        push('/signin');
      }
    } catch (e) {
      if (anonymous) {
        const { token, ...user } = await api.createAnonymousSession();
        api.token = token;
        Storage.set('auth-token', token);
        setUser(user);
        setLoading(false);
        return;
      }
      signout(false);
      setLoading(false);
    }
  }, [anonymous, push, route, signout]);

  const initialFetch = useRef(fetchMe);

  useEffect(() => {
    initialFetch.current();
  }, []);

  const isPublicUrl = PUBLIC_URLS.includes(route);

  if (!isPublicUrl && loading) return <Loading />;

  return (
    <context.Provider
      value={{
        user,
        loading,
        error,
        success,
        signin,
        signup,
        signout,
        sendPasswordResetMail,
        passwordReset,
      }}
    >
      {isPublicUrl && (
        <style>{`
html {
  font-size: 15px;
}
`}</style>
      )}
      {children}
    </context.Provider>
  );
};

export default UserProvider;
