import express, { NextFunction, Request, Response } from 'express';
import services from '../services';
import passport from 'passport';
import {
  enforceMFA,
  forbidAccessTokens,
  isAuthenticated,
  isSuperAdmin,
} from '../middlewares/authentication';
import { AuthenticationError } from '../types/errors';
import { EventType } from '../eda';
import { FindUserQuery } from '../services/identity/users';
import { syscfg } from '../config';
import { getAccessToken } from '../oidc/jwks';

const loginHandler = (strategy: string) =>
  async function (
    req: Request<any, any>,
    res: Response<PrismeaiAPI.AnonymousAuth.Responses.$200>,
    next: NextFunction
  ) {
    passport.authenticate(
      strategy,
      { session: true },
      async (err, user, info) => {
        if (err || !user) {
          next(info);
          await req.broker.send(EventType.FailedLogin, {
            email: req.body.email,
            ip: req.context?.http?.ip,
          });
          return;
        }

        req.logIn(user, async (err) => {
          if (err) {
            req.logger?.error(err);
            return next(
              new AuthenticationError('Unknown authentication error')
            );
          }

          // Mimic OIDC emitted JWT tokens so we can validate / handle these anonymous session exactly like for OIDC tokens
          const { token, jwt, expires } = await getAccessToken(user.id);
          req.session.prismeaiSessionId = token.prismeaiSessionId;
          req.session.mfaValidated = false;
          res.send({
            ...user,
            token: jwt,
            sessionId: req.session.prismeaiSessionId,
            expires,
          });
          const provider = strategy === 'local' ? 'prismeai' : strategy;
          await req.broker.send<Prismeai.SucceededLogin['payload']>(
            EventType.SucceededLogin,
            {
              email: user.email,
              ip: req.context?.http?.ip,
              id: user.id,
              authData: {
                [provider]: {},
              },
              session: {
                id: req.session.prismeaiSessionId,
                expiresIn: syscfg.SESSION_COOKIES_MAX_AGE,
                expires,
              },
            }
          );
        });
      }
    )(req, res, next);
  };

async function reAuthenticate(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.email || !req.body?.currentPassword) {
    throw new AuthenticationError();
  }

  const password: string = req.body.currentPassword;
  const identity = services.identity(req.context, req.logger);
  await identity.login(req.user.email, password);
  return next();
}

async function signupHandler(
  req: Request<any, any, PrismeaiAPI.Signup.RequestBody>,
  res: Response<PrismeaiAPI.Signup.Responses.$200>,
  next: NextFunction
) {
  const { context, body } = req;
  const identity = services.identity(context, req.logger);
  const user = await identity.signup(body);
  await req.broker.send(EventType.SucceededSignup, {
    ip: req.context?.http?.ip,
    user,
  });
  return res.send(user);
}

async function meHandler(
  req: Request,
  res: Response<PrismeaiAPI.GetMyProfile.Responses.$200>
) {
  res.send({
    ...(req.user as any),
    sessionId: req.session.prismeaiSessionId,
  });
}

async function resetPasswordHandler(
  req: Request<any, any, any>, // <any, any, PrismeaiAPI.ResetPassword.RequestBody> seems not well supported because of oneOf
  res: Response<PrismeaiAPI.ResetPassword.Responses.$200>,
  next: NextFunction
) {
  const {
    context,
    body: { email, language, token, password },
  } = req;
  const identity = services.identity(context, req.logger);

  if (token && password) {
    const user = await identity.resetPassword({ password, token });
    req.broker
      .send<Prismeai.SucceededPasswordReset['payload']>(
        EventType.SucceededPasswordReset,
        {
          ip: req.context?.http?.ip,
          email: user?.email!,
        }
      )
      .catch((err) => req.logger.error(err));
    return res.send(user);
  }

  try {
    await identity.sendResetPasswordLink({ email, language });
    req.broker
      .send<Prismeai.SucceededPasswordReset['payload']>(
        EventType.SucceededPasswordResetRequested,
        {
          ip: req.context?.http?.ip,
          email,
        }
      )
      .catch(req.logger.error);
  } catch (error) {
    (req.logger || console).error(error);
  }
  return res.send();
}

async function validateAccountHandler(
  req: Request<any, any, any>,
  res: Response<PrismeaiAPI.ResetPassword.Responses.$200>,
  next: NextFunction
) {
  const {
    context,
    body: { email, language, token },
  } = req;
  const identity = services.identity(context, req.logger);

  if (token) {
    await identity.validateAccount({ token });
    return res.send({ success: true });
  }

  await identity.sendAccountValidationLink({ email, language });
  return res.send({ success: true });
}

/**
 * MFA
 */

async function setupUserMFAHandler(
  req: Request<any, any, PrismeaiAPI.SetupMFA.RequestBody>,
  res: Response<PrismeaiAPI.SetupMFA.Responses.$200>,
  next: NextFunction
) {
  const { user, context, body } = req;
  const identity = services.identity(context, req.logger);

  const mfa = await identity.setupUserMFA(user!, body);
  req.session.mfaValidated = true;
  await identity.updateUser({
    mfa: body.method,
    id: user?.id!,
  });
  return res.send(mfa);
}

async function mfaHandler(
  req: Request<any, any, PrismeaiAPI.MFA.RequestBody>,
  res: Response<PrismeaiAPI.MFA.Responses.$200>,
  next: NextFunction
) {
  const { user, context, body, broker } = req;
  const identity = services.identity(context, req.logger);
  try {
    await identity.validateMFA(user!, body);
  } catch (err) {
    broker.send<Prismeai.FailedMFA['payload']>(EventType.FailedMFA, {
      email: user?.email!,
      ip: req.context?.http?.ip,
    });
    throw err;
  }
  req.session.mfaValidated = true;
  return res.send({ success: true });
}

/**
 * Access Tokens
 */
async function listAccessTokensHandler(
  req: Request,
  res: Response<PrismeaiAPI.ListAccessTokens.Responses.$200>,
  next: NextFunction
) {
  const { user, context } = req;
  const identity = services.identity(context, req.logger);
  const accessTokens = await identity.listAccessTokens(user!);
  return res.send(accessTokens);
}

async function createAccessTokenHandler(
  req: Request<any, any, PrismeaiAPI.CreateAccessToken.RequestBody>,
  res: Response<PrismeaiAPI.CreateAccessToken.Responses.$200>,
  next: NextFunction
) {
  const { user, context, body } = req;
  const identity = services.identity(context, req.logger);
  const accessToken = await identity.createAccessToken(user!, body);
  return res.send(accessToken);
}

async function deleteAccessTokenHandler(
  req: Request<{ token: string }>,
  res: Response<PrismeaiAPI.DeleteAccessToken.Responses.$200>,
  next: NextFunction
) {
  const {
    user,
    context,
    params: { token },
  } = req;
  const identity = services.identity(context, req.logger);
  const accessToken = await identity.deleteAccessToken(user!, token);
  return res.send(accessToken);
}

async function logoutHandler(req: Request, res: Response) {
  req.logout();
  res.status(200).send();
}

/**
 * Internal route
 */
async function findContactsHandler(
  req: Request<any, any, FindUserQuery>,
  res: Response<{
    contacts: Prismeai.User[];
  }>
) {
  const {
    context,
    body: { email, ids },
    logger,
    user,
  } = req;
  if (user?.authData?.anonymous) {
    throw new AuthenticationError();
  }
  const identity = services.identity(context, logger);
  return res.send({
    contacts: await identity.findContacts(
      {
        email,
        ids,
      },
      isSuperAdmin(req)
    ),
  });
}

async function setMetaHandler(
  req: Request<any, any, PrismeaiAPI.SetMeta.RequestBody>,
  res: Response<PrismeaiAPI.SetMeta.Responses.$200>
) {
  const { context, logger, user } = req;
  if (!user || !user.id || user?.authData?.anonymous) {
    throw new AuthenticationError();
  }
  const identity = services.identity(context, logger);

  const meta = {
    ...(user.meta || {}),
    ...req.body,
  };
  await identity.updateUser({
    id: user.id,
    meta,
  });
  res.send(meta);
}

async function deleteMetaHandler(
  req: Request<any, any, PrismeaiAPI.DeleteMeta.PathParameters>,
  res: Response<PrismeaiAPI.DeleteMeta.Responses.$200>
) {
  const {
    context,
    logger,
    user,
    params: { key },
  } = req;
  if (!user || !user.id || user?.authData?.anonymous) {
    throw new AuthenticationError();
  }
  const identity = services.identity(context, logger);

  const meta = Object.entries(user.meta || {}).reduce((prev, [k, v]) => {
    if (k === key) return prev;
    return {
      ...prev,
      [k]: v,
    };
  }, {});

  await identity.updateUser({
    id: user.id,
    meta,
  });
  res.send(meta);
}

const app = express.Router();

app.get(`/me`, isAuthenticated, meHandler);
app.post(`/contacts`, findContactsHandler);

// From there, only routes restricted to users, forbidden to access tokens
app.use(forbidAccessTokens);

app.post(`/login`, loginHandler('local'));
app.post(`/login/anonymous`, loginHandler('anonymous'));
app.post(`/login/mfa`, isAuthenticated, mfaHandler);
app.post(`/signup`, signupHandler);
app.post(`/logout`, logoutHandler);

// User account
app.post(`/user/password`, resetPasswordHandler);
app.post(`/user/validate`, validateAccountHandler);
app.post(`/user/mfa`, reAuthenticate, enforceMFA, setupUserMFAHandler);

app.get(`/user/accessTokens`, isAuthenticated, listAccessTokensHandler);
app.post(`/user/accessTokens`, isAuthenticated, createAccessTokenHandler);
app.delete(
  `/user/accessTokens/:token`,
  isAuthenticated,
  deleteAccessTokenHandler
);
app.post('/user/meta', isAuthenticated, setMetaHandler);
app.delete('/user/meta/:key', isAuthenticated, deleteMetaHandler);
export default app;
