import { Broker } from '@prisme.ai/broker';
import { RUNTIME_EMITS_BROKER_TOPIC } from '../../../../../config';
import { InvalidEventError } from '../../../../errors';
import { AppContext } from '../../../workspaces';
import { ContextsManager } from '../../contexts';

export async function emit(
  { event, payload, target, options }: Prismeai.Emit['emit'],
  broker: Broker,
  ctx: ContextsManager,
  appContext?: AppContext
) {
  try {
    return await broker.send(
      appContext?.appInstanceFullSlug
        ? `${appContext?.appInstanceFullSlug}.${event}`
        : event,
      payload || {},
      {
        ...appContext,
        userId: undefined, // Only custom events sent from API or Websocket have their source userId sent
        // sessionId might have been manually changed since given broker initialization
        sessionId: ctx.session?.sessionId || broker.parentSource?.sessionId,
        serviceTopic: RUNTIME_EMITS_BROKER_TOPIC,
      },
      { target, options },
      true
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
