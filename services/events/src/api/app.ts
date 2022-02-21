'use strict';
import http from 'http';
import express, { Application } from 'express';
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
import { Subscriptions } from '../services/events/Subscriptions';
import { EventsStore } from '../services/events/store';
import { AccessManager } from '../permissions';
import { accessManagerMiddleware } from './middlewares/accessManager';

export function initAPI(
  app: Application,
  httpServer: http.Server,
  eventsSubscription: Subscriptions,
  eventsStore: EventsStore,
  accessManager: AccessManager
) {
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
  initMetrics(app);

  /**
   * Traceability
   */
  /**
   * When running Express app behind a proxy we need to detect client IP address correctly.
   * For NGINX the following must be configured 'proxy_set_header X-Forwarded-For $remote_addr;'
   * @link http://expressjs.com/en/guide/behind-proxies.html
   */
  app.set('trust proxy', true);

  app.use(requestDecorator);

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
  initRoutes(app, httpServer, eventsSubscription, eventsStore, accessManager);

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
}
