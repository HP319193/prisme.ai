import { Application, NextFunction, Request, Response } from 'express';
import passport from 'passport';
import {
  Strategy as JWTStrategy,
  ExtractJwt as ExtractJWT,
} from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import cookieParser from 'cookie-parser';
import { createClient } from '@redis/client';
import expressSession from 'express-session';
import connectRedis from 'connect-redis';
import { storage, syscfg, eda, oidcCfg, authProviders } from '../../config';
import { Strategy as CustomStrategy } from 'passport-custom';
import services from '../../services';
import { NotFoundError, PrismeError } from '../../types/errors';
import { UserStatus } from '../../services/identity/users';
import { ResourceServer } from '../../config/oidc';
import {
  AuthProviders,
  OidcProviderConfig,
  SamlProviderConfig,
} from '../../services/identity';
import { logger } from '../../logger';
import { extractRequestIp } from '../traceability';
import { initOidcStrategy } from './initOidcStrategy';
import { initSamlStrategy } from './initSamlStrategy';

const cookieExtractor = (req: Request) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['access-token'];
    if (token) {
      req.locals = {
        ...req.locals,
        authScheme: 'cookie',
      };
    }
  }
  return token;
};

export async function init(app: Application) {
  app.use(cookieParser());
  initPassportStrategies(services.identity());

  const redisClient = createClient({
    url: storage.Sessions.host,
    legacyMode: true,
    password: storage.Sessions.password,
    name: `${eda.APP_NAME}-sessions`,
    ...storage.Sessions.driverOptions,
  });
  redisClient.on('error', (err: Error) => {
    console.error(`Error occured with express-session redis driver : ${err}`);
  });
  await redisClient.connect();
  const sessionsStore = new (connectRedis(expressSession))({
    client: redisClient,
    disableTouch: true, // Without this, sessions TTL are reset on every request
  });

  // First check for access token to generate their session before express-session
  app.use(async function (req, res, next) {
    const bearer = (req.headers['authorization'] ||
      req.headers[syscfg.LEGACY_SESSION_HEADER] ||
      '') as string;
    const token = bearer.startsWith('Bearer ') ? bearer.slice(7) : bearer;
    if (typeof token === 'string' && token.startsWith('at:')) {
      const identity = services.identity();
      req.session = (await identity.validateAccessToken(
        token
      )) as Request['session'];
    }
    next();
  });

  app.use(
    expressSession({
      store: sessionsStore,
      saveUninitialized: false,
      secret: syscfg.SESSION_COOKIES_SIGN_SECRET,
      resave: false,
      cookie: {
        maxAge: syscfg.SESSION_COOKIES_MAX_AGE * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: syscfg.EXPRESS_SESSION_COOKIE_SAMESITE,
      },
      unset: 'destroy',
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function (user, done) {
    done(null, (<Prismeai.User>user).id);
  });

  // Authenticate after express-session as the req.session initialization would otherwise prevent express-session from restoring existing session
  app.use((req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      'jwt',
      { session: false },
      (err: Error, user: Prismeai.User, info: any) => {
        // Err are exceptions coming from our own code, while info is generated by passport middlewares
        err = err || info;

        if (err instanceof Error) {
          if ((info?.message || '').includes('No auth token')) {
            req.authError = `No authentication token found`;
          } else if ((info?.message || '').includes('jwt malformed')) {
            req.authError = `Malformed authentication token`;
          } else if ((info?.message || '').includes('secret or public key')) {
            req.authError = `Authentication token signed with an unknown key`;
          } else {
            (req.logger || logger).error({
              msg: `Failed request authentication`,
              path: req.path,
              sourceWorkspaceId:
                req.context?.sourceWorkspaceId ||
                req.get(syscfg.SOURCE_WORKSPACE_ID_HEADER),
              ip: extractRequestIp(req),
              userAgent: req.get('User-Agent') as string,
              err,
            });
            req.authError = err?.message;
          }
        } else if (user) {
          req.user = user;
        }
        next();
      }
    )(req, res, next);
  });
}

async function initPassportStrategies(
  users: ReturnType<typeof services.identity>
) {
  async function deserializeUser(
    id: string | { provider: string; authData: Prismeai.AuthData },
    done: (err: Error | undefined, user: Prismeai.User | null) => void
  ) {
    try {
      const users = services.identity();

      let user: Prismeai.User;

      // If id is an object, this means we come from an external provider
      if (typeof id === 'object' && id.provider && id.authData?.id) {
        user = await users.externalLoginOrSignup(
          id.provider as AuthProviders,
          id.authData
        );
      } else if (typeof id === 'string') {
        user = await users.get(<string>id);
      } else {
        return done(
          new PrismeError('Invalid id param to deserializeUser', { id }, 500),
          null
        );
      }

      if (user.status && user.status !== UserStatus.Validated) {
        done(undefined, null);
        return;
      }
      done(undefined, user);
      return user;
    } catch (err) {
      if (err instanceof NotFoundError) {
        done(undefined, null);
        return;
      }
      done(err as Error, null);
    }
  }
  passport.deserializeUser(deserializeUser);

  passport.use(
    'anonymous',
    new CustomStrategy(async function (req, done) {
      const savedUser = await users.anonymousLogin(req.body.expiresAfter);
      try {
        done(null, savedUser);
      } catch (err) {
        done(err, null);
      }
    })
  );

  passport.use(
    new JWTStrategy(
      {
        secretOrKeyProvider: passportJwtSecret({
          cache: true,
          rateLimit: false, // Do not activate, as 1 unknown JWT-kid keeping sending requests would prevent any further request & block valid requests. This caused a downtime there ...
          // jwksRequestsPerMinute: 5,
          jwksUri: oidcCfg.JWKS_URL,
          timeout: 300,
        }),
        audience: ResourceServer,
        issuer: oidcCfg.PROVIDER_URL,
        algorithms: ['RS256'],
        jwtFromRequest: ExtractJWT.fromExtractors([
          cookieExtractor,
          ExtractJWT.fromAuthHeaderAsBearerToken(),
        ]),
        passReqToCallback: true,
      },
      async (req: Request, token: any, done: any) => {
        // Runtime emitted JWT do not necessarily include authenticated sessions, but they'are always sent to keep source correlationId/workspaceId along the way
        if (token.prismeaiSessionId) {
          // Keep restored express-session object instance for update capabilities
          req.session = Object.assign(req.session || {}, {
            prismeaiSessionId: token.prismeaiSessionId,
            expires: new Date(token.exp * 1000).toISOString(),
            mfaValidated: false,
          });

          // Cookie scheme would be set from cookieExtractor, so the only other possible scheme is bearer
          if (!req.locals?.authScheme) {
            req.locals = {
              ...req.locals,
              authScheme: 'bearer',
            };
          }
        }

        // For better traceability, allow keeping same correlationId from internal HTTP calls
        if (token.correlationId) {
          req.context = {
            ...req.context,
            correlationId: token.correlationId,
          };
        }

        if (token.workspaceId) {
          req.context = {
            ...req.context,
            sourceWorkspaceId: token.workspaceId,
          };
        }
        delete req.headers['authorization']; // Do not pass user JWT to backed services
        if (token.prismeaiSessionId) {
          deserializeUser(token.sub, done as any);
        } else {
          done();
        }
      }
    )
  );

  /**
   * Generic OIDC / Saml strategies
   */
  for (let [providerName, provider] of Object.entries(
    authProviders.providers || {}
  )) {
    if (!provider.type || provider.type === 'oidc') {
      const config = provider.config as OidcProviderConfig;
      initOidcStrategy(providerName, config, deserializeUser);
    } else if (provider.type === 'saml') {
      const config = provider.config as SamlProviderConfig;
      initSamlStrategy(providerName, config, deserializeUser);
    }
  }
}
