import { Logger } from "../../logger";

export const healthcheck = (logger: Logger) => async () => {
  return {
    healthy: true,
  };
};
