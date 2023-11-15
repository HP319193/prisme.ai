import express, { Request, Response } from 'express';
import { asyncRoute } from '../utils/async';
import { EventsStore } from '../../services/events/store';
import { isInternallyAuthenticated } from '../middlewares/accessManager';
import { ElasticsearchStore } from '../../services/events/store/ElasticsearchStore';
import { EventType } from '../../eda';

export function initCleanupRoutes(store: EventsStore) {
  async function cleanupIndicesHandler(
    { query, broker, logger }: Request,
    res: Response
  ) {
    const es = store as ElasticsearchStore;

    const dryRun =
      typeof query?.dryRun !== 'undefined' &&
      <any>query?.dryRun !== false &&
      <any>query?.dryRun != 'false' &&
      <any>query.dryRun != '0';

    const result = await es.cleanupIndices(query, dryRun);
    if (!dryRun) {
      broker
        .send<Prismeai.CleanedEvents['payload']>(
          EventType.CleanedEvents,
          result
        )
        .catch(logger.error);
    }
    return res.status(200).send(result);
  }

  const app = express.Router();
  app.use(isInternallyAuthenticated);

  app.post(`/indices`, asyncRoute(cleanupIndicesHandler));

  return app;
}
