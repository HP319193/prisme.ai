import passport from 'passport';
import OAuth2Strategy from 'passport-oauth2';
import { URL } from 'url';
import { verifyToken as verifyExternalToken } from '../../services/jwks/external';
import { EventType } from '../../eda';
import { OidcProviderConfig } from '../../services/identity';
import { syscfg } from '../../config';
import { AuthenticationError } from '../../types/errors';
import { Request } from 'express';
import { DeserializeUser } from './types';

export async function initOidcStrategy(
  strategyName: string,
  config: OidcProviderConfig,
  deserializeUser: DeserializeUser
) {
  passport.use(
    strategyName,
    new OAuth2Strategy(
      {
        authorizationURL: config.authorization_endpoint,
        tokenURL: config.token_endpoint,
        clientID: config.client_id,
        clientSecret: config.client_secret,
        callbackURL: new URL('/v2/login/callback', syscfg.API_URL).toString(),
        scope: (config?.scopes || ['openid', 'email', 'profile']).join(' '),
        state:
          typeof config.state === 'undefined' || config.state ? true : false,
        passReqToCallback: true,
      },
      async function (
        req: Request,
        _: any, // Access token
        __: any, // Refresh token
        params: any,
        ___: any, // Profile
        done: any
      ) {
        if (!params.id_token) {
          return done(
            new AuthenticationError('JWT missing in token_endpoint response')
          );
        }
        const claims = await verifyExternalToken(
          params.id_token,
          strategyName,
          config.jwks_uri
        );
        if (!claims) {
          return done(new AuthenticationError('Invalid JWT'));
        }
        const user = await deserializeUser(
          {
            provider: strategyName,
            authData: {
              ...claims,
              id: claims.sub,
              email: claims.email,
              firstName: claims.given_name,
              lastName: claims.family_name,
              language: claims.locale,
            },
          },
          done as any
        );
        if ((<any>user)?.newAccount) {
          req.broker
            .send(EventType.SucceededSignup, {
              ip: req.context?.http?.ip,
              user,
            })
            .catch((err: any) => req.logger.error({ err }));
        }
      }
    )
  );
}
