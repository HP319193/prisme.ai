import { Broker, EventSource } from '@prisme.ai/broker';
import { RUNTIME_EMITS_BROKER_TOPIC } from '../../../config';
import { AccessManager } from '../../permissions';
import { ActionType, SubjectType } from '../../permissions';

const sendEvent = async (
  workspaceId: string,
  event: {
    type: string;
    payload?: any;
    target?: Prismeai.PrismeEventTarget;
    source?: { serviceTopic?: string };
  },
  accessManager: Required<AccessManager>,
  broker: Broker,
  additionalSource?: Partial<EventSource>
) => {
  const partialSource: Partial<EventSource> = {
    workspaceId: workspaceId,
    userId: accessManager.user.id,
    sessionId: accessManager.user.sessionId,
    serviceTopic: event?.source?.serviceTopic || RUNTIME_EMITS_BROKER_TOPIC,
  };
  await accessManager.throwUnlessCan(ActionType.Create, SubjectType.Event, {
    ...event,
    source: partialSource,
  } as Prismeai.PrismeEvent);

  return await broker
    .child(partialSource, {
      validateEvents:
        partialSource?.serviceTopic !== RUNTIME_EMITS_BROKER_TOPIC,
    })
    .send(
      event.type,
      event.payload || {},
      {
        serviceTopic: partialSource.serviceTopic,
        ...additionalSource,
      },
      {
        target: event.target,
      },
      true
    );
};

export { sendEvent };
export default sendEvent;
