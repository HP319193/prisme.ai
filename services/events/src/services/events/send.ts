import { Broker, EventSource } from '@prisme.ai/broker';
import { RUNTIME_EMITS_BROKER_TOPIC } from '../../../config';
import { AccessManager } from '../../permissions';
import { ActionType, SubjectType } from '../../permissions';

const sendEvent = async (
  workspaceId: string,
  event: { type: string; payload?: any },
  accessManager: Required<AccessManager>,
  broker: Broker
) => {
  const partialSource: Partial<EventSource> = {
    workspaceId: workspaceId,
  };
  await accessManager.throwUnlessCan(ActionType.Create, SubjectType.Event, {
    ...event,
    source: partialSource,
  } as Prismeai.PrismeEvent);

  return await broker
    .child(partialSource, {
      validateEvents: false,
      forceTopic: RUNTIME_EMITS_BROKER_TOPIC,
    })
    .send(event.type, event.payload || {});
};

export { sendEvent };
export default sendEvent;
