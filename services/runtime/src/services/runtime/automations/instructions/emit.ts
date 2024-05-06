import { Broker, EventSource } from '@prisme.ai/broker';
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
  const emitSourceContext: Partial<EventSource> = {
    ...appContext,
    userId: undefined, // Only custom events sent from API or Websocket have their source userId sent
    // sessionId might have been manually changed since given broker initialization
    sessionId: ctx.session?.sessionId || broker.parentSource?.sessionId,
    serviceTopic: RUNTIME_EMITS_BROKER_TOPIC,
    automationDepth: ctx.depth,
  };

  if (payload == undefined || payload == null) {
    payload = {};
  }

  // Do not allow emitting a non object payload as it could not be persisted
  if (typeof payload !== 'object' || Array.isArray(payload)) {
    return await broker.send(
      appContext?.appInstanceFullSlug
        ? `${appContext?.appInstanceFullSlug}.error`
        : 'error',
      {
        error: 'InvalidEventError',
        message: `Event payload must be an object, received ${
          payload?.constructor?.name || typeof payload
        }`,
        details: {
          event: event,
          payload,
        },
      },
      emitSourceContext,
      {},
      {
        throwErrors: true,
      }
    );
  }

  try {
    return await broker.send(
      appContext?.appInstanceFullSlug
        ? `${appContext?.appInstanceFullSlug}.${event}`
        : event,
      payload || {},
      emitSourceContext,
      { target, options },
      {
        throwErrors: true,
      }
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
