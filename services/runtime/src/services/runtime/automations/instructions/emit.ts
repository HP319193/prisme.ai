import { Broker } from '@prisme.ai/broker';
import { RUNTIME_EMITS_BROKER_TOPIC } from '../../../../../config';
import { InvalidEventError } from '../../../../errors';
import { AppContext } from '../../../workspaces';

export async function emit(
  { event, payload }: Prismeai.Emit['emit'],
  broker: Broker,
  appContext?: AppContext
) {
  try {
    return await broker.send(
      appContext?.appInstanceFullSlug
        ? `${appContext?.appInstanceFullSlug}.${event}`
        : event,
      payload || {},
      appContext,
      RUNTIME_EMITS_BROKER_TOPIC
    );
  } catch (error) {
    if (
      (error as any)?.message &&
      (<any>error).message.includes('Invalid event name')
    ) {
      throw new InvalidEventError((<any>error).message);
    } else {
      throw error;
    }
  }
}
