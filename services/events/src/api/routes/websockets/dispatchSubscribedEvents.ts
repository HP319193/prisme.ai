import { Broker, PrismeEvent } from '@prisme.ai/broker';
import { Subscriptions } from '../../../services/events/subscriptions';
import { logger } from '../../../logger';
import { EventType } from '../../../eda';

export function dispatchSubscribedEvents(
  broker: Broker,
  subscriptions: Subscriptions,
  targetTopic: string,
  dispatch: (event: PrismeEvent, rooms: string[]) => void
) {
  // Listen current instance queue & dispach event to corresponding websockets
  broker.on<Prismeai.EventsWebsocketsMessage['payload']>(
    targetTopic,
    (event) => {
      const workspaceId = event.payload?.event?.source?.workspaceId;
      if (!workspaceId) {
        logger.error({
          msg: `Cannot forward event ${event.payload?.event?.type} (${event.payload?.event?.id}) to socketio clients as it does not have any source.workspaceId defined`,
        });
        return true;
      }
      const rooms = event.payload?.rooms;
      if (!rooms?.length || !event.payload?.event?.type) {
        return true;
      }

      dispatch(event.payload.event, rooms);

      return true;
    }
  );

  subscriptions.start((event, subscribers) => {
    let targetTopicsNb = 0;
    // Map instances targetTopic to their corresponding subscribers socketIds (= rooms)
    const targetTopics = subscribers.reduce<Record<string, Set<string>>>(
      (targetTopics, cur) => {
        if (!cur.targetTopic) {
          logger.error({
            msg: `Cannot forward event ${event.type} (${event.id}) to subscriber ${cur.socketId} as it does not have any targetTopic defined.`,
          });
          return targetTopics;
        }
        if (!targetTopics[cur.targetTopic]) {
          targetTopicsNb += 1;
          targetTopics[cur.targetTopic] = new Set();
        }
        targetTopics[cur.targetTopic].add(cur.socketId);
        return targetTopics;
      },
      {}
    );

    // Pass the event to each instance with 1 or more subscribed room
    for (let [targetTopic, rooms] of Object.entries(targetTopics)) {
      broker
        .send<Prismeai.EventsWebsocketsMessage['payload']>(
          EventType.EventsWebsocketsMessage,
          {
            event,
            rooms: [...rooms],
          },
          {
            serviceTopic: targetTopic,
          },
          {
            options: {
              persist: false,
            },
          },
          {
            disableCatchAll: true,
            disableValidation: true,
          }
        )
        .catch(logger.error);
    }
    logger.debug({
      msg: `Sending ${event.type} to ${subscribers.length} subscribers accross ${targetTopicsNb} instances`,
      targetTopics: subscribers.map((cur) => cur.targetTopic),
    });
  });
}
