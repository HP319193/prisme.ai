import express, { NextFunction, Request, Response } from 'express';
import services from '../services';

import {
  enforceMFA,
  forbidAccessTokens,
  isAuthenticated,
  isSuperAdmin,
} from '../middlewares/authentication';
import { AuthenticationError } from '../types/errors';
import { EventType } from '../eda';
import { FindUserQuery } from '../services/identity/users';
import { initAuthProviders } from './authProviders';
import Provider from 'oidc-provider';

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
  const { context, body, headers } = req;
  const identity = services.identity(context, req.logger);

  const user = await identity.signup(body, `${headers?.['referer']}`);
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

export default function initIdentityRoutes(oidc: Provider) {
  const app = express.Router();

  app.get(`/me`, isAuthenticated, meHandler);
  app.post(`/contacts`, findContactsHandler);

  // From there, only routes restricted to users, forbidden to access tokens
  app.use(forbidAccessTokens);

  initAuthProviders(app, oidc);
  app.post(`/signup`, signupHandler);

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
  return app;
}
