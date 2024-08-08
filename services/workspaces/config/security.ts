// Permissions
export const FIRST_CUSTOM_RULE_PRIORITY = 100;
// last priority must be lower than platform-level priority rules as used in permissions/config.ts
export const LAST_CUSTOM_RULE_PRIORITY = 999;

// Owners & custom roles will always have this regex applied for secrets
// Wile super admins can only manage these reserved secrets
const WORKSPACE_SECRET_SYSTEM_PREFIX = 'prismeai_';

export const WORKSPACE_SECRET_SYSTEM_REGEX = `^${WORKSPACE_SECRET_SYSTEM_PREFIX}.*$`;
export const WORKSPACE_SECRET_USER_REGEX = `^(?!${WORKSPACE_SECRET_SYSTEM_PREFIX}).*$`;

export const INIT_WORKSPACE_SECURITY: Prismeai.WorkspaceSecurity = {
  authorizations: {
    roles: {
      editor: {},
    },
    rules: [
      {
        role: 'editor',
        action: ['read', 'get_usage', 'aggregate_search', 'update'],
        subject: 'workspaces',
      },
      {
        role: 'editor',
        action: 'manage',
        subject: 'files',
      },
      {
        role: 'editor',
        action: ['read', 'update'],
        subject: 'pages',
      },
      {
        role: 'editor',
        action: ['read', 'update'],
        subject: 'apps',
      },
      {
        role: 'editor',
        action: ['read', 'create'],
        subject: 'events',
      },
      {
        role: 'editor',
        inverted: true,
        action: 'read',
        subject: 'events',
        conditions: {
          type: {
            $regex: '^apikeys\\.*$',
          },
        },
      },

      // By default, everyone can create events & listen their responses
      {
        action: 'create',
        subject: 'events',
        reason: `Anyone can create any events`,
        conditions: {
          'source.serviceTopic': 'topic:runtime:emit',
        },
      },
      {
        action: 'read',
        subject: 'events',
        conditions: {
          'source.serviceTopic': 'topic:runtime:emit',
          'source.sessionId': '{{session.id}}',
        },
        reason: `Anyone can read any events from its own session`,
      },
      {
        action: 'create',
        subject: 'files',
        conditions: {
          mimetype: {
            $regex: '^(.*)$',
          },
        },
        reason: `Anyone can upload any file`,
      },
    ],
  },
};
