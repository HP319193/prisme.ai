import express, { Request, Response } from 'express';
import { LogLevel } from '../../logger';
import sysServices from '../../services/sys';
import { asyncRoute } from '../utils/async';

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

const app = express.Router();

app.get(`/healthcheck`, asyncRoute(healthcheckHandler));
app.get(`/heapdump`, asyncRoute(heapdumpHandler));
app.put(`/logging`, asyncRoute(loggingHandler));

export default app;
