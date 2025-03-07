import express, { Request, Response } from 'express';
import { LogLevel } from '../../logger';
import sysServices from '../../services/sys';
import { asyncRoute } from '../utils/async';
import { isInternallyAuthenticated } from '../middlewares/accessManager';
import {
  Subscriber,
  Subscriptions,
  WorkspaceId,
  WorkspaceSubscribers,
} from '../../services/events/subscriptions';
import { Server } from 'socket.io';

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

export function initSysRoutes(subscriptions: Subscriptions, socketio: Server) {
  async function getSubscriptionsHandler(req: Request, res: Response) {
    const subscribers: Record<WorkspaceId, WorkspaceSubscribers> = (
      subscriptions as any
    ).subscribers;
    const workspaces: Record<string, Subscriber[]> = Object.entries(
      subscribers
    ).reduce(
      (workspaces, [wkId, { socketIds }]) => ({
        ...workspaces,
        [wkId]: Object.values(socketIds).map(
          ({ permissions, accessManager: _, authData: __, ...cur }) => ({
            ...cur,
            permissionsRulesNb: permissions?.ability?.rules?.length,
          })
        ),
      }),
      {}
    );

    const sockets = [...socketio.sockets.server._nsps.values()].flatMap(
      (cur) => [...cur.sockets.keys()]
    );
    return res.status(200).send({
      localTopic: subscriptions.cluster.localTopic,
      clusterWorkspacesNb: Object.keys(workspaces).length,
      clusterSubscriptionsNb: Object.values(workspaces).reduce(
        (total, all) => total + all.length,
        0
      ),
      localSocketsNb: sockets.length,
      localSocketIds: sockets,
      cluster: (subscriptions.cluster as any)?.clusterNodes,
      workspaces,
    });
  }

  const app = express.Router();

  app.get(`/healthcheck`, asyncRoute(healthcheckHandler));
  app.get(`/heapdump`, isInternallyAuthenticated, asyncRoute(heapdumpHandler));
  app.put(`/logging`, isInternallyAuthenticated, asyncRoute(loggingHandler));
  app.get(
    `/subscriptions`,
    isInternallyAuthenticated,
    asyncRoute(getSubscriptionsHandler)
  );

  return app;
}
