import { Application } from 'express';
import passport from 'passport';

import cookieParser from 'cookie-parser';
import redis from 'redis';
import expressSession from 'express-session';
import connectRedis from 'connect-redis';
import { storage, syscfg } from '../../config';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as CustomStrategy } from 'passport-custom';
import { logger } from '../../logger';
import services from '../../services';
import { AuthenticationError } from '../../types/errors';

export async function init(app: Application) {
  app.use(cookieParser());

  const redisClient = redis.createClient({
    url: storage.Sessions.host,
    password: storage.Sessions.password,
    ...storage.Sessions.driverOptions,
  });

  app.use(
    expressSession({
      store: new (connectRedis(expressSession))({ client: redisClient }),
      //@ts-ignore
      sessionid: (req: express.Request) => req.headers[syscfg.SESSION_HEADER],
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

  passport.serializeUser(function (user, done) {
    done(null, (<Prismeai.User>user).id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const users = services.identity();
      const user = await users.get(<string>id);
      done(undefined, user);
    } catch (err) {
      done(err, undefined);
    }
  });

  initPassportStrategies(services.identity());
}

async function initPassportStrategies(
  users: ReturnType<typeof services.identity>
) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
      },
      async function (email, password, done) {
        try {
          const user = await users.login(email, password);
          return done(null, user);
        } catch (err) {
          done(null, false, { message: 'Incorrect email or password.' });
          if (!(err instanceof AuthenticationError)) {
            logger.error({
              msg: 'Unexpected error raised during passport authenticate',
              err,
            });
          }
        }
      }
    )
  );

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
