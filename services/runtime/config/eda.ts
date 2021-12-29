import { OPENAPI_FILEPATH } from "./api";

export const APP_NAME = process.env.APP_NAME || "prisme.ai-runtime";

export const EVENTS_OAS_PATH = process.env.EVENTS_OAS_PATH || OPENAPI_FILEPATH;

// export const EVENTS_OAS_URL =
//   process.env.EVENTS_OAS_URL ||
//   "https://gitlab.com/prisme.ai/prisme.ai-events/-/raw/main/specifications/swagger.yml";

export const BROKER_DRIVER = process.env.BROKER_DRIVER || "redis";

export const BROKER_HOST =
  process.env.BROKER_HOST || "redis://localhost:6379/10";

export const BROKER_PASSWORD = process.env.BROKER_PASSWORD;
