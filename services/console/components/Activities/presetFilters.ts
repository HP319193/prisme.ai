export const filters = ({ sessionId }: { sessionId?: string }) => ({
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
    type: 'runtime.interactions.triggered',
    'payload.trigger.type': 'endpoint',
  },
  shares: {
    type: 'workspaces*permissions.*',
  },
  application: {
    'source.serviceTopic': 'topic:runtime:emit',
  },
  inputEvents: {
    'source.serviceTopic': 'topic:runtime:emit',
    'source.userId': '*',
  },
  mySession: {
    'source.sessionId': `${sessionId}`,
    'source.socketId': '*',
  },
  interactions: {
    type: 'runtime.interactions.triggered',
  },
});
