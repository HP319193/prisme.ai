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
import { storage, syscfg, eda, oidcCfg } from '../../config';
import { Strategy as CustomStrategy } from 'passport-custom';
import services from '../../services';
import { AuthenticationError, NotFoundError } from '../../types/errors';
import { UserStatus } from '../../services/identity/users';
import { ResourceServer } from '../../config/oidc';

export async function init(app: Application) {
  app.use(cookieParser());

  app.use((req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      'jwt',
      { session: false },
      (_: Error, user: Prismeai.User, info: any) => {
        if (
          info instanceof Error &&
          !(info.message || '').includes('No auth token') &&
          !(info.message || '').includes('jwt malformed')
        ) {
          return next(new AuthenticationError(info.message));
        } else if (user) {
          req.user = user;
        }
        next();
      }
    )(req, res, next);
  });

  const redisClient = createClient({
    url: storage.Sessions.host,
    legacyMode: true,
    password: storage.Sessions.password,
    name: `${eda.APP_NAME}-sessions`,
    ...storage.Sessions.driverOptions,
  });
  await redisClient.connect();
  const sessionsStore = new (connectRedis(expressSession))({
    client: redisClient,
    disableTouch: true, // Without this, sessions TTL are reset on every request
  });

  // First check for access token to generate their session before express-session
  app.use(async function (req, res, next) {
    const bearer = (req.headers['authorization'] ||
      req.headers[syscfg.SESSION_HEADER] ||
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

  // Legacy sessions : remove after transition
  app.use(
    expressSession({
      store: sessionsStore,
      //@ts-ignore
      sessionid: (req: express.Request) =>
        !req.user && req.headers[syscfg.SESSION_HEADER],
      saveUninitialized: false,
      secret: syscfg.SESSION_COOKIES_SIGN_SECRET,
      resave: false,
      cookie: {
        maxAge: syscfg.SESSION_COOKIES_MAX_AGE * 1000,
        secure: process.env.NODE_ENV === 'production',
      },
      unset: 'destroy',
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new JWTStrategy(
      {
        secretOrKeyProvider: passportJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `${oidcCfg.PROVIDER_URL}/oidc/jwks`,
          timeout: 300,
        }),
        audience: ResourceServer,
        issuer: oidcCfg.PROVIDER_URL,
        algorithms: ['RS256'],
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        passReqToCallback: true,
      },
      async (req: Request, token: any, done: any) => {
        req.session = {
          prismeaiSessionId: token.prismeaiSessionId,
          mfaValidated: false,
        };
        deserializeUser(token.sub, done as any);
      }
    )
  );

  passport.serializeUser(function (user, done) {
    done(null, (<Prismeai.User>user).id);
  });

  async function deserializeUser(
    id: string,
    done: (err: Error | undefined, user: Prismeai.User | null) => void
  ) {
    try {
      const users = services.identity();
      const user = await users.get(<string>id);
      if (user.status && user.status !== UserStatus.Validated) {
        done(undefined, null);
        return;
      }
      done(undefined, user);
    } catch (err) {
      if (err instanceof NotFoundError) {
        done(undefined, null);
        return;
      }
      done(err as Error, null);
    }
  }
  passport.deserializeUser(deserializeUser);

  initPassportStrategies(services.identity());
}

async function initPassportStrategies(
  users: ReturnType<typeof services.identity>
) {
  passport.use(
    'anonymous',
    new CustomStrategy(async function (req, done) {
      const savedUser = await users.anonymousLogin();
      try {
        done(null, savedUser);
      } catch (err) {
        done(err, null);
      }
    })
  );
}
