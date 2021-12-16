import path from "path";

export const PORT = process.env.PORT || 3030;

export const CORRELATION_ID_HEADER =
  process.env.CORRELATION_ID_HEADER || "X-Correlation-Id";

export const USER_ID_HEADER =
  process.env.USER_ID_HEADER || "X-Prismeai-User-Id";

export const OPENAPI_FILEPATH =
  process.env.OPENAPI_FILEPATH ||
  path.resolve(__dirname, "../specifications/swagger.yml");
