import { BROKER_NAMESPACE } from '.';
import {
  StoreDriverOptions,
  StoreDriverType,
} from '../src/services/events/store';
import { AccessManagerOptions } from '@prisme.ai/permissions';

/*
 * Events storage
 */

export const EVENTS_STORAGE_DRIVER =
  (process.env.EVENTS_STORAGE_DRIVER as StoreDriverType) || 'elasticsearch';

export const EVENTS_STORAGE_ES_HOST =
  process.env.EVENTS_STORAGE_ES_HOST || 'http://localhost:9200';

export const EVENTS_STORAGE_ES_USER = process.env.EVENTS_STORAGE_ES_USER;

export const EVENTS_STORAGE_ES_PASSWORD =
  process.env.EVENTS_STORAGE_ES_PASSWORD;

export const EVENTS_STORAGE_NAMESPACE =
  process.env.EVENTS_STORAGE_NAMESPACE || BROKER_NAMESPACE;

export const EVENTS_STORAGE_ES_OPTIONS: StoreDriverOptions = {
  driver: EVENTS_STORAGE_DRIVER,
  host: EVENTS_STORAGE_ES_HOST,
  user: EVENTS_STORAGE_ES_USER,
  password: EVENTS_STORAGE_ES_PASSWORD,
  driverOptions: {},
};

export const EVENTS_STORAGE_ES_BULK_REFRESH = ['true', 'yes', 'y'].includes(
  (process.env.EVENTS_STORAGE_ES_BULK_REFRESH || 'no').toLowerCase()
);

/**
 * Permissions MongoDB
 */
export const PERMISSIONS_STORAGE_HOST =
  process.env.PERMISSIONS_STORAGE_HOST ||
  'mongodb://localhost:27017/permissions';

export const PERMISSIONS_STORAGE_MONGODB_OPTIONS: AccessManagerOptions['storage'] =
  {
    host: PERMISSIONS_STORAGE_HOST,
  };
