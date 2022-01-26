import { syscfg } from ".";

export default {
  APP_NAME: process.env.APP_NAME || "prisme.ai-api-gateway",

  EVENTS_OAS_PATH: process.env.EVENTS_OAS_PATH || syscfg.OPENAPI_FILEPATH,

  BROKER_DRIVER: process.env.BROKER_DRIVER || "redis",

  BROKER_HOST: process.env.BROKER_HOST || "redis://localhost:6379/0",

  BROKER_PASSWORD: process.env.BROKER_PASSWORD,

  BROKER_WHITELIST_EVENT_PREFIXES: (
    process.env.BROKER_WHITELIST_EVENT_PREFIXES || "apps."
  ).split(","),

  BROKER_NAMESPACE: process.env.BROKER_NAMESPACE,

  BROKER_TOPIC_MAXLEN: parseInt(process.env.BROKER_TOPIC_MAXLEN || "10000"),
};
