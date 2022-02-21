import {
  WORKSPACES_STORAGE_OPTIONS,
  WORKSPACES_STORAGE_TYPE,
} from '../../../config';
import { PrismeContext } from '../../api/middlewares';
import { Logger } from '../../logger';
import { broker } from '../../eda';

import WorkspacesCrud from './crud/workspaces';
import AutomationsCrud from './crud/automations';
import DSULStorage, { DSULType } from '../DSULStorage';
import { AccessManager } from '../../permissions';

const storage = new DSULStorage(
  DSULType.Workspace,
  WORKSPACES_STORAGE_TYPE,
  WORKSPACES_STORAGE_OPTIONS[WORKSPACES_STORAGE_TYPE]
);

export default (
  accessManager: Required<AccessManager>,
  logger: Logger,
  ctx: PrismeContext
) => {
  const moduleBroker = broker.child(ctx);

  const workspacesCrud = new WorkspacesCrud(
    accessManager,
    moduleBroker,
    storage
  );

  const automationsCrud = new AutomationsCrud(moduleBroker, workspacesCrud);

  return {
    createWorkspace: workspacesCrud.createWorkspace,
    getWorkspace: workspacesCrud.getWorkspace,
    updateWorkspace: workspacesCrud.updateWorkspace,
    deleteWorkspace: workspacesCrud.deleteWorkspace,
    createAutomation: automationsCrud.createAutomation,
    getAutomation: automationsCrud.getAutomation,
    updateAutomation: automationsCrud.updateAutomation,
    deleteAutomation: automationsCrud.deleteAutomation,
  };
};
