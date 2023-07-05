import express, { NextFunction, Request, Response } from 'express';
import {
  initCustomRoles,
  initExtractDSUL,
  initEmitWorkspacesUpdated,
} from '../../services/migrate';
import { asyncRoute } from '../utils/async';
import { DSULStorage } from '../../services/DSULStorage';
import { AccessManager } from '../../permissions';
import { MIGRATION_TOKEN } from '../../../config';
import { ForbiddenError } from '@prisme.ai/permissions';
import { Broker } from '@prisme.ai/broker';

export default function init(
  workspacesStorage: DSULStorage,
  accessManager: AccessManager,
  broker: Broker
) {
  async function initCustomRolesHandler(
    { body, logger, context }: Request,
    res: Response
  ) {
    const result = await initCustomRoles(
      workspacesStorage,
      accessManager,
      broker,
      body
    );
    return res.status(200).send(result);
  }

  async function initExtractDSULHandler(
    { body, logger, context }: Request,
    res: Response
  ) {
    const result = await initExtractDSUL(
      workspacesStorage,
      accessManager,
      body
    );
    return res.status(200).send(result);
  }

  async function initEmitWorkspacesUpdatedHandler(
    { body }: Request,
    res: Response
  ) {
    const result = await initEmitWorkspacesUpdated(
      workspacesStorage,
      accessManager,
      broker,
      body
    );
    return res.status(200).send(result);
  }

  const app = express.Router();
  app.use(protectMigrationRoutes);

  app.post(`/custom-roles`, asyncRoute(initCustomRolesHandler));
  app.post(`/extract-dsul`, asyncRoute(initExtractDSULHandler));
  app.post(
    `/emit-workspaces-updated`,
    asyncRoute(initEmitWorkspacesUpdatedHandler)
  );

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
