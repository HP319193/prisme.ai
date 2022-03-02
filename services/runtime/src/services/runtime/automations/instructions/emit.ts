import { Broker } from '@prisme.ai/broker';
import { InvalidEventError } from '../../../../errors';
import { AppContext } from '../../../workspaces';

export async function emit(
  { event, payload }: Prismeai.Emit['emit'],
  broker: Broker,
  appContext?: AppContext
) {
  if (!event.startsWith('apps.')) {
    throw new InvalidEventError(
      "Trying to send an invalid event (only allowed events are 'apps.*.*')",
      {
        event: event,
      }
    );
  }

  return await broker.send(event, payload || {}, appContext);
}
