export * from './redis';
import { RedisDriver } from './redis';
import { Consumer, PrismeEvent } from '../events';

export interface SubscriptionOptions {
  // If true, each event will be received by a single instance of each distinct microservice
  GroupPartitions: boolean;

  // If true, will call user callbacks only once & stop listening to requested events afterwards
  ListenOnlyOnce: boolean;

  // If ListenOnlyOnce is true, this will the the promise timeout in milliseconds
  ListenOnlyOnceTimeout?: number;

  // If true, considers any event as processed as soon as it has been passed to a callback
  NoAck: boolean;

  // Only if GroupPartitions is false
  // Allows checking for events emitted before the broker.on() call
  ListenFrom?: number;
}

export interface PendingEvents {
  total: number;
  events: {
    type: string;
    pending: number;
  }[];
}
export interface DriverSendOptions {
  // Redis driver specific option to avoid overhead of sending specific events to its catchall stream if not required (i.e events:websockets:* topics)
  disableCatchAll?: boolean;
}

export interface Driver {
  ready: Promise<boolean>;

  send: (
    event: Omit<PrismeEvent, 'id'>,
    topic: string,
    opts?: DriverSendOptions
  ) => Promise<PrismeEvent>;
  on(
    topic: string | string[],
    cb: (event: PrismeEvent) => boolean | Promise<boolean>,
    subscriptionOpts?: Partial<SubscriptionOptions>
  ): Promise<boolean>;
  all(
    cb: (event: PrismeEvent) => boolean | Promise<boolean>,
    subscriptionOpts?: Partial<SubscriptionOptions>
  ): Promise<boolean>;

  setExpiration(topic: string, ttl: number): Promise<any>;

  pending(): Promise<PendingEvents>;

  close(): void;
}

export interface DriverOptions {
  type: string;
  host: string;
  password?: string;
  consumer: Consumer;
  subscription?: Partial<SubscriptionOptions>;

  // Mainly used by unit tests and preview envs to send & rcv events from distinct namespaces on the same broker instance
  namespace?: string;

  topicsMaxLen?: number; // Cap topics to a max number of events (oldest events get removed to stay under this threshold)
  maxSockets?: number; // Maximum number of client sockets opened
}

export function driver(opts: DriverOptions) {
  switch (opts.type) {
    case 'redis':
      return new RedisDriver(opts);
    default:
      throw new Error(`Unknown driver ${opts.type}`);
  }
}
