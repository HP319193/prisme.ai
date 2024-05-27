import { Broker, PrismeEvent } from '@prisme.ai/broker';
import {
  EVENTS_BUFFER_FLUSH_AT,
  EVENTS_BUFFER_FLUSH_EVERY,
  EVENTS_BUFFER_HIGH_WATERMARK,
  EVENTS_SCHEDULED_DELETION_DAYS,
} from '../../../config';
import { EventType } from '../../eda';
import { logger } from '../../logger';
import BatchExecStream from '../../utils/BatchExecStream';
import { EventsStore } from './store';

export function syncEventStoreWithEDA(store: EventsStore, broker: Broker) {
  broker.on<Prismeai.DeletedWorkspace['payload']>(
    [EventType.DeletedWorkspace],
    async function saveEvent(event): Promise<boolean> {
      const workspaceId = event.payload?.workspaceId!;
      await store.closeWorkspace(workspaceId);
      logger.info({
        msg: `Scheduled events of workspace ${workspaceId} for deletion (${EVENTS_SCHEDULED_DELETION_DAYS}d)`,
        workspaceId,
      });
      return true;
    }
  );

  const eventsStorageStream = new BatchExecStream<Prismeai.PrismeEvent>({
    highWaterMark: EVENTS_BUFFER_HIGH_WATERMARK,
    flushAt: EVENTS_BUFFER_FLUSH_AT,
    flushEvery: EVENTS_BUFFER_FLUSH_EVERY,
    maximumBulkSize: EVENTS_BUFFER_HIGH_WATERMARK,
    retryInterval: 1000,
    maximumRetries: 5,
    maximumRetryInterval: 30000,
    bulkExec: async (events) => {
      const ret = await store.bulkInsert(events);
      const throttle = ret !== true && !ret?.error?.throttle;
      return {
        throttle,
        retryItems: (throttle && ret?.error?.failedItems) || [],
      };
    },
  });

  async function saveEvent(event: PrismeEvent): Promise<boolean> {
    if (event?.options?.persist === false) {
      return true;
    }

    const written = eventsStorageStream.write(event);
    if (!written) {
      logger.warn({
        msg: `Events persistence hitting highWaterMark (${EVENTS_BUFFER_HIGH_WATERMARK})`,
      });
    }
    return written;
  }

  return saveEvent;
}
