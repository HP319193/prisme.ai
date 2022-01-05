export * from "./redis";
import { RedisDriver } from "./redis";
import { PrismeEvent, Consumer } from "../events";

export interface SubscriptionOptions {
  // If true, each event will be received by a single instance of each distinct microservice
  GroupPartitions: boolean;

  // If true, will call user callbacks only once & stop listening to requested events afterwards
  ListenOnlyOnce: boolean;

  // If true, considers any event as processed as soon as it has been passed to a callback
  NoAck: boolean;

  // Mainly used by unit tests to make concurrent calls safer
  EventsPrefix?: string;
}

export interface PendingEvents {
  total: number;
  events: {
    type: string;
    pending: number;
  }[];
}

export interface Driver {
  ready: Promise<boolean>;

  send: (event: Omit<PrismeEvent, "id">, topic: string) => Promise<PrismeEvent>;
  on(
    topic: string | string[],
    cb: (event: PrismeEvent) => boolean | Promise<boolean>,
    subscriptionOpts?: Partial<SubscriptionOptions>
  ): Promise<boolean>;
  all(
    cb: (event: PrismeEvent) => boolean | Promise<boolean>,
    subscriptionOpts?: Partial<SubscriptionOptions>
  ): Promise<boolean>;

  pending(): Promise<PendingEvents>;

  close(): void;
}

export interface DriverOptions {
  type: string;
  host: string;
  password?: string;
  consumer: Consumer;
  subscription?: Partial<SubscriptionOptions>;
}

export function driver(opts: DriverOptions) {
  switch (opts.type) {
    case "redis":
      return new RedisDriver(opts);
    default:
      throw new Error(`Unknown driver ${opts.type}`);
  }
}
