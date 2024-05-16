import {
  CONTEXT_RUN_EXPIRE_TIME,
  WAIT_DEFAULT_TIMEOUT,
} from '../../../../../config';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../../eda';
import { AppContext } from '../../../workspaces';
import { ContextsManager, ContextType } from '../../contexts';

const ALLOWED_NATIVE_EVENTS = [EventType.ExecutedAutomation];
export async function wait(
  wait: Prismeai.Wait['wait'],
  broker: Broker,
  ctx: ContextsManager,
  appContext?: AppContext
) {
  const waitId =
    'wait-' + Date.now() + '-' + (Math.random() * 100000).toFixed(0);
  const timeout = (wait.timeout || WAIT_DEFAULT_TIMEOUT) * 1000;
  const expiresAt = Date.now() + timeout;

  // Declare that we are waiting
  broker
    .send<Prismeai.PendingWait['payload']>(
      EventType.PendingWait,
      {
        id: waitId,
        expiresAt,
        wait: {
          ...wait,
          oneOf: (wait.oneOf || []).map((cur) => ({
            ...cur,
            event:
              appContext?.appInstanceFullSlug &&
              !ALLOWED_NATIVE_EVENTS.includes(cur.event as any)
                ? `${appContext?.appInstanceFullSlug}.${cur.event}`
                : cur.event,
          })),
        },
      },
      appContext,
      EventType.PendingWait
    )
    .catch(console.error);

  // Make current run context last longer than usually permitted
  ctx
    .save(ContextType.Run, CONTEXT_RUN_EXPIRE_TIME + Math.ceil(timeout / 1000))
    .catch(console.error);

  const event = await new Promise((resolve) => {
    ctx.observe(waitId, resolve);
    setTimeout(resolve, timeout);
  });

  return event;
}
