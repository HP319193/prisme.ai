import express, { NextFunction, Request, Response } from 'express';
import { migratePages } from '../../services/migrate';
import { asyncRoute } from '../utils/async';
import DSULStorage from '../../services/DSULStorage';
import { AccessManager } from '../../permissions';
import { MIGRATION_TOKEN } from '../../../config';
import { ForbiddenError } from '@prisme.ai/permissions';
import { Broker } from '@prisme.ai/broker';

export default function init(
  workspacesStorage: DSULStorage,
  accessManager: AccessManager,
  broker: Broker
) {
  async function migratePagesHandler(
    { body, logger, context }: Request,
    res: Response
  ) {
    const result = await migratePages(
      workspacesStorage,
      accessManager,
      broker,
      body
    );
    return res.status(200).send(result);
  }

  const app = express.Router();
  app.use(protectMigrationRoutes);

  app.post(`/pages`, asyncRoute(migratePagesHandler));

  return app;
}

function protectMigrationRoutes(
  { headers }: Request,
  res: Response,
  next: NextFunction
) {
  const token = headers['authorization'];
  if (!MIGRATION_TOKEN || token !== MIGRATION_TOKEN) {
    throw new ForbiddenError('Forbidden');
  }
  next();
}
