import { StorageDriverType, StorageOptions } from '../storage';
import { extractOptsFromEnv } from '../utils';

export default <Record<string, StorageOptions>>{
  Users: {
    driver: process.env.USERS_STORAGE_TYPE || StorageDriverType.Mongodb,
    host: process.env.USERS_STORAGE_HOST || 'mongodb://localhost:27017/users',
    driverOptions: extractOptsFromEnv('USERS_STORAGE_OPT_'),
  },

  Sessions: {
    driver: 'redis',
    host: process.env.SESSIONS_STORAGE_HOST || 'redis://localhost:6379/0',
    password: process.env.SESSIONS_STORAGE_PASSWORD,
    driverOptions: extractOptsFromEnv('SESSIONS_STORAGE_OPT_'),
  },

  Permissions: {
    driver: 'mongoose',
    host:
      process.env.PERMISSIONS_STORAGE_HOST ||
      'mongodb://localhost:27017/permissions',
    driverOptions: {},
  },
};
