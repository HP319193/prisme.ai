import express, { NextFunction } from "express";
import { Pipeline } from "../types";
import { buildMiddleware } from "../policies";
import { GatewayConfig } from "../config";
import { logger } from "../logger";

const log = logger.child({ module: "pipelines" });

export default async function init(
  app: express.Application,
  gtwcfg: GatewayConfig
) {
  const endpointToPipeline = gtwcfg.endpointToPipeline;
  await Promise.all(
    Object.entries(endpointToPipeline).map(async ([endpointName, pipeline]) => {
      const router = express.Router();
      const endpoint = gtwcfg.endpoint(endpointName);
      const mountPaths = endpoint.pathRegexp
        ? [RegExp(endpoint.pathRegexp)]
        : endpoint.paths || [endpoint.path || "*"];

      const pipelineHandler = await configurePipeline(pipeline, gtwcfg);
      const handlers = [
        hostFilterMiddleware(endpoint.hosts || []),
        pipelineHandler,
      ];

      mountPaths.forEach((path: string | RegExp) => {
        if (endpoint.methods) {
          endpoint.methods.forEach((m: any) => {
            (router as any)[m.trim().toLowerCase()](path, ...handlers);
            log.info("Init endpoint %s %s", m, path);
          });
        } else {
          log.info("Init endpoint %s", path);
          router.all(path, ...handlers);
        }
      });

      app.use(router);
    })
  );
}

async function configurePipeline(pipeline: Pipeline, gtwcfg: GatewayConfig) {
  const router = express.Router({ mergeParams: true });

  await Promise.all(
    pipeline.policies.map(async (policy) => {
      const middleware = await buildMiddleware(policy, gtwcfg);
      router.use(middleware);
    })
  );
  return router;
}

function hostFilterMiddleware(allowedHosts: string[]): express.RequestHandler {
  return (req: express.Request, resp: express.Response, next: NextFunction) => {
    if (
      allowedHosts.length &&
      !allowedHosts?.some((cur) => new RegExp(cur).test(req.hostname))
    ) {
      next("route");
      return;
    }
    next();
  };
}
