import express, { NextFunction, Request, Response } from 'express';
import Provider from 'oidc-provider';
import bodyParser from 'body-parser';
import passport from 'passport';
import { URL } from 'url';
import { authProviders, oidcCfg } from '../config';
import { syscfg } from '../config';
import { AuthenticationError, ConfigurationError } from '../types/errors';
import { EventType } from '../eda';
import { AuthProvider } from '../services/msal/provider';
import services from '../services';
import { isAuthenticated } from '../middlewares';
import { AuthProviders } from '../services/identity';
import { logger } from '../logger';
import { JWKStore } from '../services/jwks/store';

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

const getAnonymousLoginHandler = (jwks: JWKStore) =>
  async function anonymousLoginHandler(
    req: Request<any, any, PrismeaiAPI.AnonymousAuth.RequestBody>,
    res: Response<PrismeaiAPI.AnonymousAuth.Responses.$200>,
    next: NextFunction
  ) {
    // Make sure our passport custom middleware will receive the expiration to ensure at database layer
    if (!req.body.expiresAfter) {
      req.body.expiresAfter = oidcCfg.ACCESS_TOKENS_MAX_AGE;
    }

    passport.authenticate(
      'anonymous',
      { session: true },
      async (err, user, info) => {
        if (err || !user) {
          next(info || err);
          await req.broker.send<Prismeai.FailedLogin['payload']>(
            EventType.FailedLogin,
            {
              ip: req.context?.http?.ip,
              provider: 'anonymous',
            }
          );
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
          const { token, jwt, expires } = await jwks.getAccessToken(
            user.id,
            req.body.expiresAfter
          );
          req.session.prismeaiSessionId = token.prismeaiSessionId;
          req.session.expires = expires;
          req.session.mfaValidated = false;
          res.send({
            ...user,
            token: jwt,
            sessionId: req.session.prismeaiSessionId,
            expires,
          });

          await req.broker.send<Prismeai.SucceededLogin['payload']>(
            EventType.SucceededLogin,
            {
              email: user.email,
              ip: req.context?.http?.ip,
              id: user.id,
              authData: {
                ['anonymous']: { id: user.id },
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

async function oauthHandler(
  req: Request<any, any, any, PrismeaiAPI.OauthInit.QueryParameters>,
  res: Response<PrismeaiAPI.OauthInit.Responses.$302>,
  next: NextFunction
) {
  const { query } = req;
  const oauthConfig = authProviders.oauth?.[query.provider]?.config;
  if (!query.provider || !oauthConfig) {
    throw new ConfigurationError(
      `Unknown or missing auth provider '${query.provider}'`,
      {
        provider: query.provider,
      }
    );
  }
  req.session.oauth = {
    provider: query.provider,
  };
  return passport.authenticate(query.provider)(req, res, next);
}

export async function initAuthProviders(
  app: express.Router,
  provider: Provider,
  jwks: JWKStore
) {
  app.post(`/login/anonymous`, getAnonymousLoginHandler(jwks));
  // TODO rewrite with OIDC
  app.post(`/login/mfa`, isAuthenticated, mfaHandler);

  /**
   * OAuth2
   */
  app.get('/login/oauth', oauthHandler);
  const passportOAuthStrategies = Object.keys(authProviders.oauth || {});
  if (passportOAuthStrategies.length) {
    app.get(
      `/login/callback`,
      (
        req: Request<any, any>,
        res: Response<PrismeaiAPI.AnonymousAuth.Responses.$200>,
        next: NextFunction
      ) => {
        return passport.authenticate(
          passportOAuthStrategies,
          {},
          async (err: Error, user: any) => {
            if (err || !user?.id) {
              ((<any>req)?.logger || logger).error({
                msg: `Failed OAuth provider '${req.session?.oauth?.provider}' authentication with an error : ${err?.message}. Redirect user back to sign out.`,
                err,
              });
              req.broker
                .send<Prismeai.FailedLogin['payload']>(EventType.FailedLogin, {
                  ip: req.context?.http?.ip,
                  provider: req.session?.oauth?.provider,
                })
                .catch(logger.warn);
              try {
                const loginInteraction = await provider.interactionDetails(
                  req,
                  res
                );
                return res.redirect(
                  (loginInteraction?.params?.redirect_uri as string) ||
                    oidcCfg.getSignoutUri()
                );
              } catch (err) {
                return res.redirect(oidcCfg.getSignoutUri());
              }
            }

            const result = {
              login: {
                accountId: user.id!,
                acr: 'urn:mace:incommon:iap:bronze',
                amr: [req.session?.oauth?.provider!],
                remember: true,
                ts: Math.floor(Date.now() / 1000),
              },
              consent: {},
            };
            await provider.interactionFinished(req, res, result);
          }
        )(req, res, next);
      }
    );
  }

  /**
   * Azure SSO
   */
  const authProvider = new AuthProvider(authProviders.msal);
  const redirectPath = '/login/azure/callback';
  const REDIRECT_URI = new URL('/v2' + redirectPath, syscfg.API_URL).toString();

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
