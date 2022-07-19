import { Broker } from '@prisme.ai/broker';
import { RUNTIME_EMITS_BROKER_TOPIC } from '../../../../../config';
import { InvalidEventError } from '../../../../errors';
import { AppContext } from '../../../workspaces';
import { ContextsManager } from '../../contexts';

export async function emit(
  { event, payload, target }: Prismeai.Emit['emit'],
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
        // userId / sessionId might have been manually changed since given broker initialization
        userId: ctx.session?.userId || broker.parentSource?.userId,
        sessionId: ctx.session?.sessionId || broker.parentSource?.sessionId,
      },
      RUNTIME_EMITS_BROKER_TOPIC,
      { target }
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
