import express from 'express';
import initPipelines from '../pipelines';
import { GatewayConfig, syscfg } from '../config';
import errorHandler from '../middlewares/errorHandler';
import { requestDecorator } from '../middlewares/traceability';
import httpLogger from '../middlewares/httpLogger';
import {
  validationErrorMiddleware,
  validationMiddleware,
} from '../middlewares/validation';
import identityRoutes from './identity';
import bodyParser from 'body-parser';
import { init as initAuthentication } from '../middlewares';

export default async function initRoutes(
  app: express.Application,
  gtwcfg: GatewayConfig
) {
  await initAuthentication(app);
  app.use(requestDecorator);
  app.use(httpLogger);

  await initPipelines(app, gtwcfg);

  // Gateway own routes
  app.get('/', (req: any, res: any) => {
    res.send(`Prisme.ai API Gateway`);
  });

  app.use(
    bodyParser.json({ limit: syscfg.REQUEST_MAX_SIZE }),
    validationMiddleware({
      ignorePaths: ['^/sys', '^/v2/contacts'],
    }),
    validationErrorMiddleware
  );
  app.use('/v2/', identityRoutes);

  app.use(errorHandler);
}
