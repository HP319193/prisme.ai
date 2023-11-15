import { Broker } from '@prisme.ai/broker';
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

export async function syncEventStoreWithEDA(
  store: EventsStore,
  broker: Broker
) {
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

  broker.all(async function saveEvent(event): Promise<boolean> {
    if (event?.options?.persist === false) {
      return true;
    }

    await eventsStorageStream.write(event);
    return true;
  });

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
}
