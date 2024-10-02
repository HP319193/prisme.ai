import express, { NextFunction, Request, Response } from 'express';
import services from '../services';
import FormData from 'form-data';

import {
  enforceMFA,
  forbidAccessTokens,
  isAuthenticated,
  isSuperAdmin,
} from '../middlewares/authentication';
import { AuthenticationError } from '../types/errors';
import { EventType } from '../eda';
import { initAuthProviders } from './authProviders';
import Provider from 'oidc-provider';
import { GatewayConfig, syscfg } from '../config';
import fetch from 'node-fetch';
import { JWKStore } from '../services/jwks/store';
import { initCSRFToken } from '../policies/authentication';
import { init as initRateLimit } from '../policies/rateLimit';

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
  initCSRFToken(req, res);
  res.send({
    ...(req.user as any),
    sessionId: req.session.prismeaiSessionId,
    expires: req.session.expires,
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
      .catch((err) => req.logger.error({ err }));
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
 * Users route
 */
async function findContactsHandler(
  req: Request<
    any,
    any,
    PrismeaiAPI.FindContacts.RequestBody,
    PrismeaiAPI.FindContacts.QueryParameters
  >,
  res: Response<PrismeaiAPI.FindContacts.Responses.$200>
) {
  const { context, body, logger, user } = req;
  if (user?.authData?.anonymous) {
    throw new AuthenticationError();
  }
  const identity = services.identity(context, logger);
  return res.send(
    await identity.findContacts(body, req.query, isSuperAdmin(req as any))
  );
}

async function patchUserHandler(
  req: Request<
    PrismeaiAPI.PatchUser.PathParameters,
    any,
    PrismeaiAPI.PatchUser.RequestBody
  >,
  res: Response<Partial<PrismeaiAPI.PatchUser.Responses.$200>>
) {
  const { context, body, logger, params, broker } = req;
  const identity = services.identity(context, logger);

  const user = await identity.patchUser(
    params.userId || context.userId,
    body,
    isSuperAdmin(req as any)
  );

  broker
    .send<Prismeai.UpdatedUser['payload']>(
      EventType.UpdatedUser,
      {
        user: user as Prismeai.User,
      },
      {},
      {},
      {
        disableValidation: true,
      }
    )
    .catch((err) => logger.error({ err }));
  return res.send(user);
}

async function deleteMyUserHandler(
  req: Request<any, any>,
  res: Response<Partial<PrismeaiAPI.DeleteMyUser.Responses.$200>>
) {
  const { context, logger, headers } = req;
  const identity = services.identity(context, logger);

  await identity.sendAccountDeleteValidationLink(
    context.userId,
    `${headers?.['referer']}`
  );

  return res.send({ success: true });
}

async function deleteUserHandler(
  req: Request<PrismeaiAPI.DeleteUser.PathParameters, any>,
  res: Response<Partial<PrismeaiAPI.DeleteUser.Responses.$200>>
) {
  const {
    context,
    logger,
    params: { userId },
    query: { token },
  } = req;
  const identity = services.identity(context, logger);

  const deleted = await identity.deleteUser(userId, {
    token: `${token || ''}`,
    isSuperAdmin: isSuperAdmin(req as any),
  });

  await req.broker.send(EventType.DeletedUser, {
    ip: req.context?.http?.ip,
    userId,
  });

  return res.send({ success: !!deleted });
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

function postUserPhotoHandler(workspaceServiceUrl: string) {
  return async function postUserPhotoHandler(
    req: Request<any, any, PrismeaiAPI.PostUserPhoto.RequestBody>,
    res: Response<Partial<PrismeaiAPI.PostUserPhoto.Responses.$200>>
  ) {
    const identity = services.identity(req.context, req.logger);
    if (
      !req?.user?.id ||
      !req.files ||
      !Array.isArray(req.files) ||
      !req.files.length
    )
      return;

    const formData = new FormData();
    const file = req.files[0];
    formData.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    formData.append('public', 'true');
    const result = await fetch(
      `${workspaceServiceUrl}/v2/workspaces/platform/files`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const [{ url }] = await result.json();

    const user = await identity.patchUser(
      req.user.id,
      {
        photo: url,
      },
      false
    );

    res.send(user);
  };
}

export default async function initIdentityRoutes(
  oidc: Provider,
  gtwcfg: GatewayConfig,
  jwks: JWKStore
) {
  const app = express.Router();

  app.get(`/me`, isAuthenticated, meHandler);
  app.post(`/contacts`, findContactsHandler);

  // Users management, super admin only
  app.patch('/users/:userId', isAuthenticated, patchUserHandler as any);
  app.delete('/users/:userId', isAuthenticated, deleteUserHandler as any);

  // From there, only routes restricted to users, forbidden to access tokens
  app.use(forbidAccessTokens);

  initAuthProviders(app, oidc, jwks);
  const signupRateLimit = await initRateLimit({
    window: 60,
    limit: syscfg.RATE_LIMIT_SIGNUP,
    key: 'ip',
    name: 'signup',
  });
  app.post(`/signup`, signupRateLimit, signupHandler);

  // User account
  app.patch(`/user`, isAuthenticated, patchUserHandler as any);
  app.delete(`/user`, isAuthenticated, deleteMyUserHandler as any);
  const passwordResetRateLimit = await initRateLimit({
    window: 60,
    limit: syscfg.RATE_LIMIT_PASSWORD_RESET,
    key: 'ip',
    name: 'passwordReset',
  });
  app.post(
    `/user/password`,
    (req, res, next) => {
      if (!req.body.token) {
        return passwordResetRateLimit(req, res, next);
      }
      return next();
    },
    resetPasswordHandler
  );
  app.post(`/user/validate`, validateAccountHandler);
  app.post(`/user/mfa`, reAuthenticate, enforceMFA, setupUserMFAHandler);
  app.post(
    `/user/photo`,
    isAuthenticated,
    postUserPhotoHandler(gtwcfg.config.services.workspaces.url)
  );

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
