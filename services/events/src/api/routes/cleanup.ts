import express, { Request, Response } from 'express';
import { asyncRoute } from '../utils/async';
import { EventsStore } from '../../services/events/store';
import { isInternallyAuthenticated } from '../middlewares/accessManager';
import { ElasticsearchStore } from '../../services/events/store/ElasticsearchStore';

export function initCleanupRoutes(store: EventsStore) {
  async function cleanupIndicesHandler({ query }: Request, res: Response) {
    const es = store as ElasticsearchStore;
    try {
      const result = await es.cleanupIndices(query);
      return res.status(200).send(result);
    } catch (err) {
      return res.status(500).send(err);
    }
  }

  const app = express.Router();
  app.use(isInternallyAuthenticated);

  app.post(`/indices`, asyncRoute(cleanupIndicesHandler));

  return app;
}
