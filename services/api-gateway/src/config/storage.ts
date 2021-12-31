import { StorageDriverType, StorageOptions } from "../storage";
import { extractOptsFromEnv } from "../utils";

export default <Record<string, StorageOptions>>{
  Users: {
    driver: process.env.USERS_STORAGE_TYPE || StorageDriverType.Mongodb,
    host: process.env.USERS_STORAGE_HOST || "mongodb://localhost:27017/eda",
    driverOptions: extractOptsFromEnv("USERS_STORAGE_OPT_"),
  },

  Sessions: {
    driver: "redis",
    host: process.env.SESSIONS_STORAGE_HOST || "redis://localhost:6379/0",
    driverOptions: extractOptsFromEnv("SESSIONS_STORAGE_OPT_"),
  },
};
