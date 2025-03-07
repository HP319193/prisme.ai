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
import { AccessManager, SubjectType } from '../permissions';
import { accessManagerMiddleware } from './middlewares/accessManager';
import { initCollaboratorRoutes } from '@prisme.ai/permissions';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../eda';
import { PrismeError } from '../errors';
import FileStorage from '../services/FileStorage';
import { UPLOADS_MAX_SIZE } from '../../config';
import { DSULStorage } from '../services/DSULStorage';

export function initAPI(
  accessManager: AccessManager,
  dsulStorage: DSULStorage,
  uploadsStorage: FileStorage,
  broker: Broker
) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: false }));

  /**
   * Get NODE_ENV from environment and store in Express.
   */
  app.set('env', process.env.NODE_ENV);

  /**
   * Morgan logger
   */
  app.use(bodyParser.json({ limit: UPLOADS_MAX_SIZE }));
  app.use(express.json({}));
  app.use(express.urlencoded({ extended: false }));

  /**
   * Metrics
   */
  initMetrics(app, broker);

  /**
   * Traceability
   */
  /**
   * When running Express app behind a proxy we need to detect client IP address correctly
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
      ignorePaths: [
        '^/sys',
        '^/v2/pages', // expres-openapi-validator always rejects pages.appInstances[*].blocks although our schema seems correct
        '/v2/workspaces/.*/pages', // same
        '^/v2/files/',
        '^/v2/search/',
        '^/v2/workspaces/.*/files',
        '^/v2/workspaces/import',
        '^/v2/workspaces/.*/import',
        '^/v2/pages/.*/permissions',
      ],
    }),
    validationErrorMiddleware
  );

  /**
   * Sharing routes
   */
  initCollaboratorRoutes<SubjectType>(app, {
    onShared: async (req, subjectType, subjectId, share, subject) => {
      const payload = {
        subjectId,
        ...share,
      };
      const source = { workspaceId: req.context.workspaceId };
      if (subjectType === SubjectType.Page) {
        if (!source.workspaceId) {
          source.workspaceId = (subject as Prismeai.Page).workspaceId;
        }
        await req.broker.send<Prismeai.PagePermissionsShared['payload']>(
          EventType.PagePermissionsShared,
          payload,
          source
        );
      } else if (subjectType === SubjectType.Workspace) {
        await req.broker.send<Prismeai.WorkspacePermissionsShared['payload']>(
          EventType.WorkspacePermissionsShared,
          payload,
          source
        );
      } else {
        throw new PrismeError(
          `No event declared for '${subjectType}' sharing !`,
          {}
        );
      }
    },
    onRevoked: async (req, subjectType, subjectId, target, subject) => {
      const payload = {
        subjectId,
        target,
      };
      const source = { workspaceId: req.context.workspaceId };
      if (subjectType === SubjectType.Page) {
        if (!source.workspaceId) {
          source.workspaceId = (subject as Prismeai.Page).workspaceId;
        }
        await req.broker.send<Prismeai.PagePermissionsDeleted['payload']>(
          EventType.PagePermissionsDeleted,
          payload,
          source
        );
      } else if (subjectType === SubjectType.Workspace) {
        await req.broker.send<Prismeai.WorkspacePermissionsDeleted['payload']>(
          EventType.WorkspacePermissionsDeleted,
          payload,
          source
        );
      } else {
        throw new PrismeError(
          `No event declared for '${subjectType}' permissions deletion !`,
          {}
        );
      }
    },
  });

  /**
   * User routes
   */
  initRoutes(app, dsulStorage, uploadsStorage, accessManager, broker);

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
