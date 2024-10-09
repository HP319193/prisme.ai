import express, { NextFunction } from 'express';
import { Pipeline } from '../types';
import { buildMiddleware, Policies } from '../policies';
import { GatewayConfig } from '../config';
import { logger } from '../logger';
import { ConfigurationError } from '../types/errors';

const log = logger.child({ module: 'pipelines' });

export default async function init(
  app: express.Application,
  gtwcfg: GatewayConfig
) {
  const endpointToPipeline = gtwcfg.endpointToPipeline;
  await Promise.all(
    Object.entries(endpointToPipeline).map(async ([endpointName, pipeline]) => {
      const endpoint = gtwcfg.endpoint(endpointName);
      const mountPaths = endpoint.pathRegexp
        ? [RegExp(endpoint.pathRegexp)]
        : endpoint.paths || [endpoint.path || '*'];

      const pipelineHandler = await configurePipeline(pipeline, gtwcfg);
      const handlers = [
        hostFilterMiddleware(endpoint.hosts || []),
        pipelineHandler,
      ];

      mountPaths.forEach((path: string | RegExp) => {
        if (endpoint.methods) {
          endpoint.methods.forEach((m: any) => {
            (app as any)[m.trim().toLowerCase()](path, ...handlers);
            log.info('Init endpoint %s %s', m, path);
          });
        } else {
          log.info('Init endpoint %s', path);
          app.all(path, ...handlers);
        }
      });
    })
  );
}

async function configurePipeline(pipeline: Pipeline, gtwcfg: GatewayConfig) {
  const router = express.Router({ mergeParams: true });

  await Promise.all(
    pipeline.policies.map(async ({ match, ...policy }) => {
      const middleware = await buildMiddleware(
        policy as any as Policies,
        gtwcfg
      );
      const paths = match?.paths || [true];
      do {
        const curPath = paths.shift();
        if (!curPath) {
          break;
        }
        const args =
          typeof curPath === 'string' && curPath
            ? [curPath, middleware]
            : [middleware];
        if (match?.methods?.length) {
          for (let method of match.methods) {
            const handler = (router as any)[method.trim().toLowerCase()];
            if (!handler) {
              throw new ConfigurationError(
                `Invalid method ${method} specified in configuration`,
                {}
              );
            }
            handler.call(router, ...args);
          }
        } else {
          router.use(...(args as any));
        }
      } while (paths.length);
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
      next('route');
      return;
    }
    next();
  };
}
