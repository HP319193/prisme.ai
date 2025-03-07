'use strict';

import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import {
  errorDecorator,
  finalErrorHandler,
  requestDecorator,
} from './middlewares';
import initRoutes from './routes';
import { initMetrics } from '../metrics';
import {
  validationErrorMiddleware,
  validationMiddleware,
} from './middlewares/validation';
import Runtime from '../services/runtime';
import { Broker } from '@prisme.ai/broker';
import { accessManagerMiddleware } from './middlewares/accessManager';
import { AccessManager } from '../permissions';
import { Cache } from '../cache';

export function init(
  runtime: Runtime,
  broker: Broker,
  accessManager: AccessManager,
  cache: Cache
) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());

  /**
   * Get NODE_ENV from environment and store in Express.
   */
  app.set('env', process.env.NODE_ENV);

  /**
   * Morgan logger
   */
  app.use(bodyParser.json());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  /**
   * Metrics
   */
  initMetrics(app, broker);

  /**
   * Traceability
   */
  /**
   * When running Express app behind a proxy we need to detect client IP address correctly.
   * For NGINX the following must be configured 'proxy_set_header X-Forwarded-For $remote_addr;'
   * @link http://expressjs.com/en/guide/behind-proxies.html
   */
  app.set('trust proxy', true);

  app.use(requestDecorator(broker));
  app.use(accessManagerMiddleware(accessManager));

  /**
   * Validation
   */
  app.use(
    validationMiddleware({
      ignorePaths: ['^/sys'],
    }),
    validationErrorMiddleware
  );

  /**
   * User routes
   */
  initRoutes(app, runtime, broker, cache);

  /**
   * ERROR HANDLING
   */

  /**
   * Decorate error object with additional data
   */
  app.use(errorDecorator);

  /**
   * Custom error handling middleware - final
   * WARNING: Must be defined last, after other app.use(), routes calls
   * and all other error handling middleware
   */
  app.use(finalErrorHandler);

  return app;
}
