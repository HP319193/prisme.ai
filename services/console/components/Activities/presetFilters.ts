export const filters = {
  versions: {
    type: 'workspaces.versions.published',
  },
  errors: {
    types: 'error,runtime.fetch.failed',
  },
  updates: {
    type: 'workspaces.*',
  },
  webhooks: {
    type: 'runtime.webhooks.triggered',
  },
  shares: {
    type: 'workspaces*permissions.*',
  },
  application: {
    'source.serviceTopic': 'topic:runtime:emit',
  },
};
