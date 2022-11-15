import { Driver, DriverOptions, SubscriptionOptions } from '..';
import { ClientPool } from './clientPool';

enum RedisKey {
  StreamPrefix = 'streams:',
  InternalPrefix = 'internal:',
  CatchAllStream = 'catchall_stream',
}

export class RedisDriver implements Driver {
  private client: ClientPool;
  public ready: Promise<any>;
  private consumerId: string;
  public groupName: string;
  private grouppedEvents: Set<string>;
  private subscriptionOpts: SubscriptionOptions;
  private namespace?: string;
  private closed: boolean;
  private serverTimeOffset: number;

  constructor(opts: DriverOptions) {
    this.groupName = opts.consumer.service;
    this.consumerId = opts.consumer.name;
    this.grouppedEvents = new Set();
    this.subscriptionOpts = {
      GroupPartitions: true,
      ListenOnlyOnce: false,
      NoAck: false,
      ...(opts.subscription || {}),
    };
    this.namespace = opts.namespace;
    this.closed = false;
    this.serverTimeOffset = 0;

    this.client = new ClientPool(opts);
    this.ready = this.client.ready;
    this.ready.then(() => {
      this.detectServerTimeOffset();
    });
  }

  async detectServerTimeOffset() {
    const fakeMsg = await this.client.send(
      {},
      RedisKey.InternalPrefix + 'time_tests'
    );
    const [curTime] = (fakeMsg?.id || '').split('-');
    if (curTime) {
      const localTime = Date.now();
      this.serverTimeOffset = localTime - parseInt(curTime);
    }
  }

  getTime() {
    return Date.now() - this.serverTimeOffset;
  }

  getTopicStreams(topics: string[]) {
    return topics.map((topic) => {
      return `${RedisKey.StreamPrefix}${this.namespace || ''}${topic}`;
    }) as any as string[];
  }

  async send(event: any, topic: string) {
    const stream = this.getTopicStreams([topic])[0];
    this.client.send(event, this.getTopicStreams([RedisKey.CatchAllStream])[0]);
    const result = await this.client.send(event, stream);

    const [curTime] = (result?.id || '').split('-');
    if (curTime) {
      const localTime = Date.now();
      this.serverTimeOffset = localTime - parseInt(curTime);
    }

    return result;
  }

  async on(
    topic: string | string[],
    cb: (event: any) => any,
    overrideSubscriptionOpts?: SubscriptionOptions,
    lastKnownIds?: Record<string, string>, // Internal use only,
    startedAt?: number
  ) {
    if (!startedAt) {
      startedAt = Date.now();
    }

    const subscriptionOpts = {
      ...this.subscriptionOpts,
      ...overrideSubscriptionOpts,
    };

    const topics = Array.isArray(topic) ? topic : [topic];
    const streams = this.getTopicStreams(topics);

    const initializedLastKnownIds =
      lastKnownIds ||
      streams.reduce(
        (ids, stream) => ({
          ...ids,
          [stream]: `${subscriptionOpts.ListenFrom || this.getTime()}-0`,
        }),
        {}
      );
    const eventsByStream = await (subscriptionOpts.GroupPartitions
      ? this.client.readStreamsPartition(
          this.groupName,
          this.consumerId,
          subscriptionOpts,
          streams
        )
      : this.client.readStreams(
          streams,
          streams.map((curStream) => initializedLastKnownIds?.[curStream] || '')
        ));

    // Transmit received events to callback
    const processedStreams = Object.entries(eventsByStream).map(
      ([streamName, events]) => ({
        streamName,
        events,
        results: events.map(cb),
        lastId: events.length
          ? events[events.length - 1].id
          : initializedLastKnownIds?.[streamName],
        types: new Set(events.map((cur) => cur.type)),
      })
    );
    const receivedData = processedStreams.some(({ events }) => !!events.length);
    if (
      !receivedData &&
      subscriptionOpts.ListenOnlyOnce &&
      subscriptionOpts.ListenOnlyOnceTimeout &&
      Date.now() - startedAt > subscriptionOpts.ListenOnlyOnceTimeout
    ) {
      cb(null);
      return true;
    }

    // Acknowledge processed events
    if (!subscriptionOpts.NoAck) {
      Promise.all(
        processedStreams.map(async ({ streamName, events, results, types }) => {
          if (subscriptionOpts.GroupPartitions) {
            this.grouppedEvents = new Set([
              ...(<any>this.grouppedEvents),
              ...(<any>types),
            ]);
          }

          return Promise.all(
            results.map((result, idx) => {
              const event = events[idx];
              (result instanceof Promise
                ? result
                : Promise.resolve(result)
              ).then((result) => {
                if (result === true) {
                  this.client.acknowledgeMessage(
                    streamName,
                    this.groupName,
                    event.id
                  );
                }
              });
            })
          );
        })
      );
    }

    if (!this.closed && (!subscriptionOpts.ListenOnlyOnce || !receivedData)) {
      const updatedLastKnownIds = {
        ...(initializedLastKnownIds || {}),
        ...processedStreams.reduce(
          (lastIds, { streamName, lastId }) => ({
            ...lastIds,
            [streamName]: lastId,
          }),
          {}
        ),
      };
      this.on(
        topics,
        cb,
        overrideSubscriptionOpts,
        updatedLastKnownIds,
        startedAt
      );
    }

    return true;
  }

  async all(
    cb: (event: any) => any,
    overrideSubscriptionOpts?: SubscriptionOptions
  ) {
    return this.on(RedisKey.CatchAllStream, cb, overrideSubscriptionOpts);
  }

  async pending() {
    const monitoredEvents = Array.from(this.grouppedEvents);
    const pending = await Promise.all(
      monitoredEvents.map((cur) =>
        this.client.pendingMessages(
          this.getTopicStreams([cur])[0],
          this.groupName
        )
      )
    );

    return {
      total: pending.reduce((tot, cur) => tot + cur.pending, 0),
      events: monitoredEvents
        .map((type, idx) => ({
          type: type as any,
          pending: pending[idx].pending,
        }))
        .filter((cur) => cur.pending),
    };
  }

  async close() {
    this.closed = true;
    return await this.client.closeClients();
  }
}
