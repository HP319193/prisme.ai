// Permissions
export const FIRST_CUSTOM_RULE_PRIORITY = 100;
// last priority must be lower than platform-level priority rules as used in permissions/config.ts
export const LAST_CUSTOM_RULE_PRIORITY = 999;

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
    ],
  },
};
