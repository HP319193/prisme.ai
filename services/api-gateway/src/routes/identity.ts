import express, { NextFunction, Request, Response } from 'express';
import services from '../services';
import passport from 'passport';
import { isAuthenticated } from '../middlewares/authentication';
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
          next(new AuthenticationError(info.message));
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
          res.send({
            ...user,
            token: req.sessionID,
            sessionId: req.session.prismeaiSessionId,
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
                expires: new Date(
                  Date.now() + syscfg.SESSION_COOKIES_MAX_AGE * 1000
                ).toISOString(),
              },
            }
          );
        });
      }
    )(req, res, next);
  };

async function signupHandler(
  req: Request<any, any, PrismeaiAPI.Signup.RequestBody>,
  res: Response<PrismeaiAPI.Signup.Responses.$200>,
  next: NextFunction
) {
  const { context, body } = req;
  const identity = services.identity(context);
  const user = await identity.signup(body);
  await req.broker.send(EventType.SucceededSignup, {
    ip: req.context?.http?.ip,
    user,
  });
  loginHandler('local')(req, res, next);
}

async function resetPasswordHandler(
  req: Request<any, any, any>, // <any, any, PrismeaiAPI.ResetPassword.RequestBody> seems not well supported because of oneOf
  res: Response<PrismeaiAPI.ResetPassword.Responses.$200>,
  next: NextFunction
) {
  const {
    context,
    body: { email, token, password },
  } = req;
  const identity = services.identity(context);

  if (token && password) {
    const user = await identity.resetPassword({ password, token });
    /*  
    await req.broker.send(EventType.SucceededPasswordReset, {
    ip: req.context?.http?.ip,
    user,
    }); */
    return res.send(user);
  }

  const result = await identity.sendResetPasswordLink({ email });
  /*  
  await req.broker.send(EventType.SucceededPasswordResetRequest, {
  ip: req.context?.http?.ip,
  user,
  }); */
  return res.send(result);
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
  { context, body: { email, ids } }: Request<any, any, FindUserQuery>,
  res: Response<{
    contacts: Prismeai.User[];
  }>
) {
  const identity = services.identity(context);
  return res.send({
    contacts: await identity.find({
      email,
      ids,
    }),
  });
}

const app = express.Router();

app.post(`/login`, loginHandler('local'));
app.post(`/login/anonymous`, loginHandler('anonymous'));
app.post(`/signup`, signupHandler);
app.get(`/me`, isAuthenticated, meHandler);
app.post(`/logout`, logoutHandler);
app.post(`/user/password`, resetPasswordHandler);
// Internal routes
app.post(`/contacts`, findContactsHandler);

export default app;
