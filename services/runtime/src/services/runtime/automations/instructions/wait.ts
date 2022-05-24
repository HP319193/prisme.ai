import { WAIT_DEFAULT_TIMEOUT } from '../../../../../config';
import { Broker } from '@prisme.ai/broker';
import { EventType } from '../../../../eda';
import { AppContext } from '../../../workspaces';
import { ContextsManager, ContextType } from '../../contexts';

export async function wait(
  wait: Prismeai.Wait['wait'],
  broker: Broker,
  ctx: ContextsManager,
  appContext?: AppContext
) {
  const waitId = Date.now() + '-' + (Math.random() * 100000).toFixed(0);
  const timeout = (wait.timeout || WAIT_DEFAULT_TIMEOUT) * 1000;
  const expiresAt = Date.now() + timeout;
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
            event: appContext?.appInstanceFullSlug
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
  ctx.save(ContextType.Run, timeout / 1000).catch(console.error);

  const FulfilledWaitEvent = EventType.FulfilledWait.replace('{{id}}', waitId);

  const fulfilledWaitEvent: Prismeai.FulfilledWait | undefined =
    await new Promise(async (resolve) => {
      broker.on<Prismeai.FulfilledWait['payload']>(
        FulfilledWaitEvent,
        (event) => {
          resolve(event as any);
          return true;
        },
        {
          GroupPartitions: false,
          ListenOnlyOnce: true,
          ListenOnlyOnceTimeout: timeout,
        }
      );
    });

  return fulfilledWaitEvent?.payload?.event;
}
