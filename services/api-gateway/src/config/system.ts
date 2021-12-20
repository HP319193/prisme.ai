import path from "path";

export default {
  PORT: process.env.PORT || 6666,

  GATEWAY_CONFIG:
    process.env.GATEWAY_CONFIG_PATH ||
    path.join(__dirname, "../../gateway.config.yml"),

  CORRELATION_ID_HEADER:
    process.env.CORRELATION_ID_HEADER || "X-Correlation-Id",

  USER_ID_HEADER: process.env.USER_ID_HEADER || "X-Prismeai-User-Id",

  PRISME_AUTH_PARSE_URL:
    "http://localhost:1337/parse/1" || process.env.PRISME_AUTH_PARSE_URL,

  PRISME_AUTH_PARSE_APP_ID:
    "gogowego-2016" || process.env.PRISME_AUTH_PARSE_APP_ID,
};
