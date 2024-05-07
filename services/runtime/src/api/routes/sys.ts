import express, { Request, Response } from 'express';
import { LogLevel } from '../../logger';
import sysServices from '../../services/sys';
import { asyncRoute } from '../utils/async';
import { Cache } from '../../cache';
import { API_KEY_HEADER, INTERNAL_API_KEY } from '../../../config';
import { updateRuntimeJWK } from '../../utils/jwks';
import { Broker } from '@prisme.ai/broker';

async function healthcheckHandler(req: Request, res: Response) {
  const sys = sysServices(req.logger, req.context);
  const result = await sys.healthcheck();
  res.send(result);
}

async function heapdumpHandler(req: Request, res: Response) {
  const sys = sysServices(req.logger, req.context);
  req.logger.info({ msg: 'Requested heapdump' });
  await sys.heapdump();
  res.status(200).send({ msg: 'successfully took a heap dump' });
}

async function loggingHandler(
  { body, logger, context }: Request,
  res: Response
) {
  const sys = sysServices(logger, context);
  const { level } = body;
  const availableLevels = Object.values(LogLevel.valueOf()).map((cur) =>
    cur.toLowerCase()
  );
  if (!level || !availableLevels.includes(level.toLowerCase())) {
    return res.status(400).send({ error: 'Missing or invalid level' });
  }
  sys.changeLogLevel(level);
  return res
    .status(200)
    .send({ msg: `Succesfully changed log level to ${level}` });
}

export default function init(broker: Broker, cache: Cache) {
  const app = express.Router();

  async function updateJWKCertsHandler(
    { body, headers }: Request,
    res: Response
  ) {
    if (typeof body.jwk !== 'object') {
      return res
        .status(400)
        .send({ error: 'InvalidRequest', message: `Missing jwk` });
    }

    if (INTERNAL_API_KEY && headers[API_KEY_HEADER] != INTERNAL_API_KEY) {
      return res
        .status(401)
        .send({ error: 'Forbidden', message: `Unauthorized access` });
    }
    await updateRuntimeJWK(broker, cache, body.jwk);

    return res.status(200).send({ msg: `Succesfully updated JWK` });
  }

  app.get(`/healthcheck`, asyncRoute(healthcheckHandler));
  app.get(`/heapdump`, asyncRoute(heapdumpHandler));
  app.put(`/logging`, asyncRoute(loggingHandler));
  app.post('/certs', asyncRoute(updateJWKCertsHandler));

  return app;
}
