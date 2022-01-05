import path from "path";

export default {
  PORT: process.env.PORT || 3001,
  DEBUG: ["dev", "development"].includes(process.env.NODE_ENV || "production"),

  GATEWAY_CONFIG:
    process.env.GATEWAY_CONFIG_PATH ||
    path.join(__dirname, "../../gateway.config.yml"),

  OPENAPI_FILEPATH:
    process.env.OPENAPI_FILEPATH ||
    path.resolve(__dirname, "../../specifications/swagger.yml"),

  CORRELATION_ID_HEADER:
    process.env.CORRELATION_ID_HEADER || "X-Correlation-Id",
  USER_ID_HEADER: process.env.USER_ID_HEADER || "X-Prismeai-User-Id",

  SESSION_COOKIES_MAX_AGE: parseInt(
    process.env.SESSION_COOKIES_MAX_AGE || <any>(30 * 24 * 60 * 60)
  ), // 1 month (seconds)

  SESSION_COOKIES_SIGN_SECRET:
    process.env.SESSION_COOKIES_SIGN_SECRET || ",s6<Mt3=dE[7a#k{)4H)C4%",
};
