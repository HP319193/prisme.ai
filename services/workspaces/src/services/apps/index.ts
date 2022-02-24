import {
  WORKSPACES_STORAGE_OPTIONS,
  WORKSPACES_STORAGE_TYPE,
} from '../../../config';
import { PrismeContext } from '../../api/middlewares';
import { Logger } from '../../logger';
import { broker } from '../../eda';

import AppsCrud from './crud/apps';
import DSULStorage, { DSULType } from '../DSULStorage';
import { AccessManager } from '../../permissions';
import { workspaces as workspacesServices } from '..';

const storage = new DSULStorage(
  DSULType.App,
  WORKSPACES_STORAGE_TYPE,
  WORKSPACES_STORAGE_OPTIONS[WORKSPACES_STORAGE_TYPE]
);

export default (
  accessManager: Required<AccessManager>,
  workspaces: ReturnType<typeof workspacesServices>,
  logger: Logger,
  ctx: PrismeContext
) => {
  const moduleBroker = broker.child(ctx);

  const appsCrud = new AppsCrud(
    accessManager,
    workspaces,
    moduleBroker,
    storage
  );

  return {
    listApps: appsCrud.listApps,
    publishApp: appsCrud.publishApp,
    getApp: appsCrud.getApp,
    deleteApp: appsCrud.deleteApp,
  };
};
