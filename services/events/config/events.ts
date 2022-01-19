import { BROKER_NAMESPACE } from ".";
import {
  StoreDriverOptions,
  StoreDriverType,
} from "../src/services/events/store";

export const EVENTS_BUFFER_FLUSH_AT = parseInt(
  process.env.EVENTS_BUFFER_FLUSH_AT || "128"
);
export const EVENTS_BUFFER_HIGH_WATERMARK = parseInt(
  process.env.EVENTS_BUFFER_HIGH_WATERMARK || "256"
);

export const EVENTS_BUFFER_FLUSH_EVERY = parseInt(
  process.env.EVENTS_BUFFER_FLUSH_EVERY || "5000"
);

export const EVENTS_RETENTION_DAYS = parseInt(
  process.env.EVENTS_RETENTION_DAYS || `${30 * 6}`
);

/*
 * Events storage
 */

export const EVENTS_STORAGE_DRIVER =
  (process.env.EVENTS_STORAGE_DRIVER as StoreDriverType) || "elasticsearch";

export const EVENTS_STORAGE_ES_HOST =
  process.env.EVENTS_STORAGE_ES_HOST || "http://localhost:9200";

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
