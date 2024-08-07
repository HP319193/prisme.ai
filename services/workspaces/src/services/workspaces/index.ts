export { Workspaces } from './crud/workspaces';
export { default as Automations } from './crud/automations';
export * from './crud/security';
export { default as Pages } from './crud/pages';
export { default as AppInstances } from './crud/appInstances';

export { initWorkspacesConfigSyncing } from './syncWorkspacesWithConfigContexts';
export { initDetailedPagesSyncing } from './syncDetailedPagesWithEDA';
export {
  initOAuthClientsSyncing,
  getWorkspaceClientId,
} from './syncWorkspacesWithOAuthClients';
