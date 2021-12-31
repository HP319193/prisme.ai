import { syscfg } from ".";

export default {
  APP_NAME: process.env.APP_NAME || "prisme.ai-api-gateway",

  EVENTS_OAS_PATH: process.env.EVENTS_OAS_PATH || syscfg.OPENAPI_FILEPATH,

  BROKER_DRIVER: process.env.BROKER_DRIVER || "redis",

  BROKER_HOST: process.env.BROKER_HOST || "redis://localhost:6379/0",

  BROKER_PASSWORD: process.env.BROKER_PASSWORD,
};
