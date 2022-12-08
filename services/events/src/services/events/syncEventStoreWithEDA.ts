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
    bulkExec: async (events) => {
      await store.bulkInsert(events);
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
