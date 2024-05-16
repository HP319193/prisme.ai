import { Broker } from '@prisme.ai/broker';
import { Cache } from '../cache';
import { EventType } from '../eda';
import { logger } from '../logger';
import EventEmitter from 'events';

const EVENTS_NODES_TOPIC = `events.nodes`;
const EVENTS_NODES_PING_INTERVAL = 60 * 1000;
const EVENTS_NODES_INACTIVITY_TIMEOUT = 3 * EVENTS_NODES_PING_INTERVAL;

export interface ClusterNodeState {
  id: string;
  targetTopic: string; // This is a broker topic only read by that instance for directed communication
  lastActiveAt: number;
}

export class ClusterNode extends EventEmitter {
  private broker: Broker;
  private cache: Cache;
  public id: string;
  public localTopic: string;

  private clusterNodes: Record<string, ClusterNodeState>;

  constructor(broker: Broker, cache: Cache) {
    super();
    this.broker = broker;
    this.cache = cache;
    this.id =
      broker.consumer?.name ||
      process.env.HOSTNAME ||
      `${Math.round(Math.random() * 100000)}`;
    this.localTopic = `events:websockets:${this.id}`;
    this.clusterNodes = {};
  }

  async start() {
    this.clusterNodes = (await this.cache.getClusterNodes()) as Record<
      string,
      ClusterNodeState
    >;
    const ids = Object.keys(this.clusterNodes);
    logger.info({
      msg: `Discovered ${ids.length} other nodes`,
      ids,
    });

    // Declare ourself with broker + cache
    await this.cache.registerClusterNode(this.id, {
      id: this.id,
      targetTopic: this.localTopic,
      lastActiveAt: Date.now(),
    });
    await this.broker.send<Prismeai.JoinedEventsNode['payload']>(
      EventType.JoinedEventsNode,
      {
        id: this.id,
        targetTopic: this.localTopic,
      },
      {
        serviceTopic: EVENTS_NODES_TOPIC,
      }
    );

    // Start regularly refreshing our status
    setInterval(async () => {
      this.cache
        .registerClusterNode(this.id, {
          id: this.id,
          targetTopic: this.localTopic,
          lastActiveAt: Date.now(),
        })
        .catch(logger.error);
      this.broker
        .send<Prismeai.PingEventsNode['payload']>(
          EventType.PingEventsNode,
          {
            id: this.id,
            targetTopic: this.localTopic,
          },
          {
            serviceTopic: EVENTS_NODES_TOPIC,
          }
        )
        .catch(logger.error);
    }, EVENTS_NODES_PING_INTERVAL);

    // Listen to others nodes status
    this.broker.on(
      EVENTS_NODES_TOPIC,
      (event) => {
        if (
          [EventType.JoinedEventsNode, EventType.PingEventsNode].includes(
            event.type as EventType
          )
        ) {
          const { targetTopic, id } =
            event.payload as Prismeai.JoinedEventsNode['payload'];
          this.clusterNodes[id] = {
            id,
            targetTopic,
            lastActiveAt: Date.now(),
          };
        } else if (event.type === EventType.LeftEventsNode) {
          const { targetTopic, id } =
            event.payload as Prismeai.LeftEventsNode['payload'];

          delete this.clusterNodes[id];
          this.emit('left', {
            id,
            targetTopic,
          });
        }
        return true;
      },
      {
        GroupPartitions: false,
      }
    );

    // And detect inactive nodes (with GroupPartitions so that operation is done only one)
    this.broker.on(
      EVENTS_NODES_TOPIC,
      () => {
        const inactiveNodes = Object.values(this.clusterNodes).filter(
          (cur) =>
            Date.now() - cur.lastActiveAt > EVENTS_NODES_INACTIVITY_TIMEOUT
        );

        inactiveNodes.forEach((cur) => {
          logger.info({
            msg: `Consider node ${
              cur.targetTopic
            } inactive as it did not ping for ${
              Date.now() - cur.lastActiveAt
            } ms.`,
          });

          delete this.clusterNodes[cur.id];
          this.cache.unregisterClusterNode(cur.id).catch(logger.error);

          // Emit locally to allow custom cleanup not automatically done upon LeftEventsNode receival (i.e database/cache cleanup)
          this.emit('inactive', {
            id: cur.id,
            targetTopic: cur.targetTopic,
          });

          // Tell the rest of the cluster to clean their memory cache
          this.broker
            .send<Prismeai.LeftEventsNode['payload']>(
              EventType.LeftEventsNode,
              {
                id: cur.id,
                targetTopic: cur.targetTopic,
              },
              {
                serviceTopic: EVENTS_NODES_TOPIC,
              }
            )
            .catch(logger.error);
        });
        return true;
      },
      {
        GroupPartitions: true,
      }
    );
  }

  async close() {
    this.cache.unregisterClusterNode(this.id).catch(logger.error);
    await this.broker.send<Prismeai.LeftEventsNode['payload']>(
      EventType.LeftEventsNode,
      {
        id: this.id,
        targetTopic: this.localTopic,
      },
      {
        serviceTopic: EVENTS_NODES_TOPIC,
      }
    );
  }
}
