import express, { NextFunction, Request, Response } from 'express';
import initPipelines from '../pipelines';
import { GatewayConfig, oidcCfg, syscfg } from '../config';
import errorHandler from '../middlewares/errorHandler';
import { requestDecorator } from '../middlewares/traceability';
import httpLogger from '../middlewares/httpLogger';
import {
  validationErrorMiddleware,
  validationMiddleware,
} from '../middlewares/validation';
import initIdentityRoutes from './identity';
import bodyParser from 'body-parser';
import { init as initAuthentication } from '../middlewares';
import { initRoutes as initOidcRoutes } from '../services/oidc/provider';
import { Broker } from '@prisme.ai/broker';
import Provider from 'oidc-provider';
import { JWKStore } from '../services/jwks/store';

export default async function initRoutes(
  app: express.Application,
  gtwcfg: GatewayConfig,
  broker: Broker,
  oidc: Provider,
  jwks: JWKStore
) {
  // Drop legacy session cookies on logout as they would otherwise prevent from signing out
  app.use(
    oidcCfg.SIGNOUT_PATH,
    (req: Request, res: Response, next: NextFunction) => {
      res.clearCookie('connect.sid', {
        sameSite: 'none',
      });
      next();
    }
  );
  // This needs to be called before passport.authenticate('jwt',...), dunno why
  app.use('/oidc', initOidcRoutes(broker, oidc));
  await initAuthentication(app);
  app.use(requestDecorator);
  app.use(httpLogger);

  await initPipelines(app, gtwcfg);

  // Gateway own routes
  app.get('/', (req: any, res: any) => {
    res.send(`Prisme.ai API Gateway`);
  });

  app.get('/sys/healthcheck', (req: any, res: any) => {
    res.send({
      healthy: true,
    });
  });

  app.use(
    bodyParser.json({ limit: syscfg.REQUEST_MAX_SIZE }),
    validationMiddleware({
      ignorePaths: ['^/sys'],
    }),
    validationErrorMiddleware
  );
  app.use('/v2/', initIdentityRoutes(oidc, gtwcfg, jwks));

  app.use(errorHandler);
}
