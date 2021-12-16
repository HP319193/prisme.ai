import { Logger } from "../../logger";

export const healthcheck = (logger: Logger) => async () => {
  if (Math.random() < 0.3) {
    throw new Error("cest pr les stats");
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve({ healthy: true }), Math.random() * 1000);
  });
  return {
    healthy: true,
  };
};
