import { FC, useCallback, useEffect, useRef, useState } from 'react';
import context, { OperationSuccess, UserContext } from './context';
import api from '../../utils/api';
import { ApiError } from '@prisme.ai/sdk';
import { useRouter } from 'next/router';
import Storage from '../../utils/Storage';
import { Loading } from '@prisme.ai/design-system';
import getConfig from 'next/config';

const {
  publicRuntimeConfig: { PAGES_HOST = '', CONSOLE_URL = '' },
} = getConfig();

const REDIRECT_IF_SIGNED = ['/forgot', '/signin', '/signup', '/'];
const PUBLIC_URLS = [
  '/forgot',
  '/signin',
  '/signup',
  '/validate',
  '/pages/[pageSlug]',
];

interface UserProviderProps {
  anonymous?: boolean;
  redirectTo?: string;
  isPublic?: boolean;
}

async function authFromConsole() {
  return new Promise((resolve, reject) => {
    if (!window.parent) reject('no parent window found');
    const t = setTimeout(() => {
      reject('no response');
    }, 100);
    // Ask console for auth token if present
    const listener = (e: MessageEvent) => {
      const { type, token, legacy } = e.data;
      if (type === 'api.token') {
        if (legacy) {
          api.legacyToken = token;
          Storage.set('auth-token', token);
        } else {
          api.token = token;
          Storage.set('access-token', token);
        }
        clearTimeout(t);
        resolve(token);
      }
    };
    window.addEventListener('message', listener);
    window.parent.postMessage({ type: 'askAuthToken' }, CONSOLE_URL);
  });
}

export const UserProvider: FC<UserProviderProps> = ({
  anonymous,
  redirectTo,
  children,
  isPublic = false,
}) => {
  const [user, setUser] = useState<UserContext['user']>(null);
  const [loading, setLoading] = useState<UserContext['loading']>(true);
  const [error, setError] = useState<ApiError>();
  const [success, setSuccess] = useState<any>();

  const { push, route } = useRouter();

  const sendValidationMail: UserContext['sendValidationMail'] = useCallback(
    async (email: string, language: string) => {
      setLoading(true);
      setError(undefined);
      setSuccess(undefined);
      try {
        await api.sendValidationMail(email, language);
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

  const validateMail: UserContext['validateMail'] = useCallback(
    async (token: string) => {
      setLoading(true);
      setError(undefined);
      setSuccess(undefined);
      try {
        await api.validateMail(token);
        setSuccess({ type: OperationSuccess.mailValidated });
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setError(e as ApiError);
        return null;
      }
    },
    []
  );

  const sendPasswordResetMail: UserContext['sendPasswordResetMail'] =
    useCallback(async (email: string, language: string) => {
      setLoading(true);
      setError(undefined);
      setSuccess(undefined);
      try {
        await api.sendPasswordResetMail(email, language);
        setSuccess({ type: OperationSuccess.emailSent });
        setLoading(false);
      } catch (e) {
        setLoading(false);
        setError(e as ApiError);
        return null;
      }
    }, []);

  const passwordReset: UserContext['passwordReset'] = useCallback(
    async (token: string, password: string) => {
      setLoading(true);
      setError(undefined);
      setSuccess(undefined);
      try {
        await api.passwordReset(token, password);
        setSuccess({ type: OperationSuccess.passwordReset });
        setLoading(false);
        setTimeout(() => {
          setSuccess(undefined);
          push('/signin'), 2000;
        });
      } catch (e) {
        setLoading(false);
        setError(e as ApiError);
        return null;
      }
    },
    [push]
  );

  const signout: UserContext['signout'] = useCallback(
    async (onServer: boolean = true) => {
      if (onServer) {
        try {
          api.signout();
        } catch {}
      } else {
        Storage.remove('access-token');
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
      if (anonymous) {
        try {
          await authFromConsole();
        } catch {}
      }
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
      if (
        user.id &&
        REDIRECT_IF_SIGNED.includes(route) &&
        !user?.authData?.anonymous
      ) {
        const storedRedirectTo = Storage.get('redirect-once-authenticated');
        Storage.remove('redirect-once-authenticated');
        if (redirectTo) {
          push(redirectTo);
        } else if (storedRedirectTo) {
          push(storedRedirectTo);
        }
      }
      if (!user.id && !PUBLIC_URLS.includes(route)) {
        initAuthentication();
      }
    } catch (e) {
      if (
        (e as Prismeai.GenericError).error === 'AuthenticationError' &&
        (e as Prismeai.GenericError).message === 'jwt expired'
      ) {
        api.token = '';
        Storage.remove('access-token');
      }
      if (anonymous) {
        const { token, ...user } = await api.createAnonymousSession();
        api.token = token;
        Storage.set('access-token', token);
        setUser(user);
        setLoading(false);
        return;
      }
      signout(false);
      setLoading(false);
    }
  }, [anonymous, push, redirectTo, route, signout]);

  // 1. Initialize authentication flow
  const initAuthentication: UserContext['initAuthentication'] =
    useCallback(async () => {
      Storage.set('redirect-once-authenticated', window.location.href);
      // redirect_uri must be on the same domain we want the session on (i.e current one)
      const redirectionUrl = new URL('/signin', window.location.href);
      const { url, codeVerifier } = api.getAuthorizationURL(
        redirectionUrl.toString()
      );
      Storage.set('code-verifier', codeVerifier);
      window.location.href = url;
    }, []);

  // 2. Send login form
  const signin: UserContext['signin'] = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(undefined);
      setSuccess(undefined);
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const interaction = urlParams.get('interaction');
        if (!interaction) {
          throw new ApiError(
            {
              error: 'InvalidAuth',
              message: 'Missing interaction uid',
              details: {},
            },
            400
          );
        }
        const res = await api.signin({ login: email, password, interaction });
        if (res.redirectTo) {
          window.location.href = res.redirectTo;
        }
        return true;
      } catch (e) {
        const { error } = e as ApiError;

        api.token = null;
        setUser(null);
        setLoading(false);
        setError(e as ApiError);
        if (error === 'ValidateEmailError') {
          setTimeout(() => {
            setError(undefined);
            push(
              `/validate?${new URLSearchParams({
                email: email,
              }).toString()}`
            );
          }, 2000);
        }
        return false;
      }
    },
    [push]
  );

  // 3. Final step : exchange our authorization code with an access token
  const completeAuthentication: UserContext['completeAuthentication'] =
    useCallback(async (authorizationCode: string) => {
      setLoading(true);
      setError(undefined);
      setSuccess(undefined);
      try {
        const codeVerifier = Storage.get('code-verifier');
        const redirectionUrl = new URL('/signin', window.location.href);
        const { access_token } = await api.getToken(
          authorizationCode,
          codeVerifier,
          redirectionUrl.toString()
        );
        api.token = access_token;
        Storage.set('access-token', access_token);
        await fetchMe();
      } catch (e) {
        api.token = null;
        setUser(null);
        setLoading(false);
        setError(e as ApiError);
        // const { error } = e as ApiError;
        // if (error === 'ValidateEmailError') {
        //   setTimeout(() => {
        //     setError(undefined);
        //     push(
        //       `/validate?${new URLSearchParams({
        //         email: email,
        //       }).toString()}`
        //     );
        //   }, 2000);
        // }
        return;
      }
    }, []);

  const signup: UserContext['signup'] = useCallback(
    async (email, password, firstName, lastName, language) => {
      setLoading(true);
      setError(undefined);
      setSuccess(undefined);
      try {
        const { token, ...user } = await api.signup(
          email,
          password,
          firstName,
          lastName,
          language
        );
        setSuccess({ type: OperationSuccess.signupSuccess });
        setLoading(false);
        setTimeout(() => {
          setSuccess(undefined);
          push(
            `/validate?${new URLSearchParams({
              email: email,
              sent: 'true',
            }).toString()}`
          );
        }, 2000);
        return user;
      } catch (e) {
        const { error } = e as ApiError;
        if (error === 'AlreadyUsed') {
          setError(e as ApiError);
          return null;
        }
        api.token = null;
        setUser(null);
        setLoading(false);
        setError(e as ApiError);
        return null;
      }
    },
    [signin, push]
  );

  const initialFetch = useRef(fetchMe);

  useEffect(() => {
    initialFetch.current();
  }, []);

  useEffect(() => {
    // For preview in console
    const listener = async (e: MessageEvent) => {
      const { type } = e.data || {};
      const source = e.source as Window;
      if (type === 'askAuthToken' && e.origin.match(PAGES_HOST)) {
        source.postMessage(
          {
            type: 'api.token',
            token: api.token || api.legacyToken,
            legacy: !api.token && !!api.legacyToken,
          },
          e.origin
        );
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  const isPublicUrl = isPublic || PUBLIC_URLS.includes(route);

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
        initAuthentication,
        completeAuthentication,
        sendPasswordResetMail,
        passwordReset,
        sendValidationMail,
        validateMail,
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
