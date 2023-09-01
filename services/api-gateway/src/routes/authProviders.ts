import express, { NextFunction, Request, Response } from 'express';
import Provider from 'oidc-provider';
import bodyParser from 'body-parser';
import passport from 'passport';
import { URL } from 'url';
import { azureCfg } from '../config';
import { syscfg } from '../config';
import { AuthenticationError } from '../types/errors';
import { EventType } from '../eda';
import { getAccessToken } from '../services/oidc/provider';
import { AuthProvider } from '../services/msal/provider';
import services from '../services';
import { isAuthenticated } from '../middlewares';
import { AuthProviders } from '../services/identity';

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
                [provider]: {} as Prismeai.AuthData,
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

export async function initAuthProviders(
  app: express.Router,
  provider: Provider
) {
  app.post(`/login/anonymous`, loginHandler('anonymous'));
  // TODO rewrite with OIDC
  app.post(`/login/mfa`, isAuthenticated, mfaHandler);

  /**
   * Azure SSO
   */
  const authProvider = new AuthProvider(azureCfg.msal);
  const redirectPath = '/login/azure/callback';
  const REDIRECT_URI = new URL(
    '/v2' + redirectPath,
    // '/oidc/azure/callback',
    'http://localhost:3001/v2' /* syscfg.API_URL */
  ).toString();

  app.get(
    '/login/azure',
    authProvider.login({
      scopes: [],
      redirectUri: REDIRECT_URI,
      successRedirect: '/',
    })
  );

  app.post(
    redirectPath,
    bodyParser.urlencoded(),
    authProvider.handleRedirect(),
    async (req, res, next) => {
      const identity = services.identity(req.context, req.logger);
      const user = await identity.externalLoginOrSignup(
        AuthProviders.Azure,
        req.session.authData!
      );
      if (user.newAccount) {
        req.broker
          .send(EventType.SucceededSignup, {
            ip: req.context?.http?.ip,
            user,
          })
          .then(console.log)
          .catch((err) => req.logger.error({ err }));
      }

      const result = {
        login: {
          accountId: user.id!,
          acr: 'urn:mace:incommon:iap:bronze',
          amr: ['azure'],
          remember: true,
          ts: Math.floor(Date.now() / 1000),
        },
        consent: {},
      };
      await provider.interactionFinished(req, res, result);
    }
  );
}
