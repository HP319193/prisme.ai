import express, { NextFunction, Request, Response } from 'express';
import services from '../services';
import passport from 'passport';
import {
  isAuthenticated,
  isInternallyAuthenticated,
} from '../middlewares/authentication';
import { AuthenticationError } from '../types/errors';
import { EventType } from '../eda';
import { FindUserQuery } from '../services/identity/users';
import { v4 as uuid } from 'uuid';
import { syscfg } from '../config';

const loginHandler = (strategy: string) =>
  async function (
    req: Request<any, any, PrismeaiAPI.CredentialsAuth.RequestBody>,
    res: Response<PrismeaiAPI.CredentialsAuth.Responses.$200>,
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

          req.session.prismeaiSessionId = uuid();
          if (user.mfa && user.mfa !== 'none') {
            req.session.missingMFA = true;
          }
          const expires = new Date(
            Date.now() + syscfg.SESSION_COOKIES_MAX_AGE * 1000
          ).toISOString();
          res.send({
            ...user,
            token: req.sessionID,
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
                token: req.sessionID,
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

async function setupUserMFAHandler(
  req: Request<any, any, PrismeaiAPI.SetupMFA.RequestBody>,
  res: Response<PrismeaiAPI.SetupMFA.Responses.$200>,
  next: NextFunction
) {
  const { user, context, body } = req;
  const identity = services.identity(context, req.logger);

  const mfa = await identity.setupUserMFA(user!, body);
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
  const { user, context, body } = req;
  const identity = services.identity(context, req.logger);

  await identity.validateMFA(user!, body);
  req.session.missingMFA = false;
  return res.send({ success: true });
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

async function logoutHandler(req: Request, res: Response) {
  req.logout();
  res.status(200).send();
}

/**
 * Internal route
 */
async function findContactsHandler(
  { context, body: { email, ids }, logger }: Request<any, any, FindUserQuery>,
  res: Response<{
    contacts: Prismeai.User[];
  }>
) {
  const identity = services.identity(context, logger);
  return res.send({
    contacts: await identity.findContacts({
      email,
      ids,
    }),
  });
}

const app = express.Router();

app.post(`/login`, loginHandler('local'));
app.post(`/login/anonymous`, loginHandler('anonymous'));
app.post(`/login/mfa`, isAuthenticated, mfaHandler);
app.post(`/signup`, signupHandler);
app.post(`/logout`, logoutHandler);

// User account
app.get(`/me`, isAuthenticated, meHandler);
app.post(`/user/password`, resetPasswordHandler);
app.post(`/user/validate`, validateAccountHandler);
app.post(`/user/mfa`, reAuthenticate, setupUserMFAHandler);

// Internal routes
app.post(`/contacts`, isInternallyAuthenticated, findContactsHandler);

export default app;
