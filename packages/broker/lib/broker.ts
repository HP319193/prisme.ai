import {
  Consumer,
  EventsFactory,
  EventSource,
  NativeTopic,
  PrismeEvent,
  Topic,
} from './events';
import { driver, Driver, DriverOptions, SubscriptionOptions } from './drivers';
import { ValidatorOptions } from './events/validator';

export type EventSender = (
  eventType: string,
  payload: object,
  partialSource?: Partial<EventSource>
) => Promise<boolean>;

export type CallbackContext = any;

export type EventCallback<
  CallbackContext,
  PayloadType extends object = object
> = (
  event: PrismeEvent<PayloadType>,
  broker: Broker<CallbackContext>,
  ctx: CallbackContext
) => boolean | Promise<boolean>;

export interface ProcessedEventMetrics {
  pickupDelay: number;
  procesDuration: number;
}

interface CallbackContextCtor<CallbackContext> {
  new (event: PrismeEvent): CallbackContext;
}

export interface BrokerOptions<CallbackContext = any> {
  driver: Omit<DriverOptions, 'consumer'>;
  validator: ValidatorOptions;
  CallbackContextCtor?: CallbackContextCtor<CallbackContext>;
}

const DEFAULT_DRIVER_OPTS: BrokerOptions['driver'] = {
  type: 'redis',
  host: 'redis://localhost:6379/10',
};

type Buffer = Omit<PrismeEvent<object>, 'id'>[];

export class Broker<CallbackContext = any> {
  public service: string;
  public consumer: Consumer;
  private eventsFactory: EventsFactory;
  private driver: Driver;
  public ready: Promise<any>;
  public parentSource: Partial<EventSource>;

  private _buffer: false | Buffer;
  private validateEvents: boolean;
  private forceTopic?: string;

  private CallbackContextCtor?: CallbackContextCtor<CallbackContext>;
  public onProcessedEventCallback?: (
    event: PrismeEvent,
    metrics: ProcessedEventMetrics
  ) => void;
  public onErrorCallback?: (event: PrismeEvent, error: Error) => void;

  constructor(
    consumer: Omit<Consumer, 'name'> & {
      name?: string;
    },
    {
      driver: driverOpts,
      validator: validatorOpts,
      CallbackContextCtor,
    }: BrokerOptions<CallbackContext>
  ) {
    this.consumer = {
      name: process.env.HOSTNAME || `${Math.round(Math.random() * 100000)}`,
      ...consumer,
    };
    this.service = this.consumer.service;
    this.eventsFactory = new EventsFactory({ validator: validatorOpts });
    this.driver = driver({
      consumer: this.consumer,
      ...(driverOpts || DEFAULT_DRIVER_OPTS),
    });
    this.parentSource = {};
    this.CallbackContextCtor = CallbackContextCtor;
    this._buffer = false;
    this.validateEvents = true;

    this.ready = Promise.all([
      this.eventsFactory.ready,
      this.driver.ready,
    ]).then((statuses) => statuses.every(Boolean));
  }

  child(
    parentSource: Partial<EventSource>,
    opts?: {
      validateEvents: boolean;
      forceTopic?: string;
    }
  ): Broker<CallbackContext> {
    const child = Object.assign({}, this, {
      parentSource: {
        ...this.parentSource,
        ...parentSource,
        userId: parentSource.userId || this.parentSource.userId,
        workspaceId: parentSource.workspaceId || this.parentSource.workspaceId,
        correlationId:
          parentSource.correlationId || this.parentSource.correlationId,
      },
      _buffer: false,
      ...opts,
    });
    Object.setPrototypeOf(child, Broker.prototype);
    return child;
  }

  buffer(enabled: boolean) {
    this._buffer = enabled ? [] : false;
  }

  async flush(disableBuffer?: boolean) {
    if (!this._buffer) {
      throw new Error(
        'Trying to flush broker although buffer is not activated'
      );
    }
    const results = this._buffer.map((event) =>
      this.driver.send(event, event.source.topic!)
    );
    this._buffer = disableBuffer ? false : [];
    return await Promise.all(results);
  }

  clear(disableBuffer?: boolean) {
    this._buffer = disableBuffer ? false : [];
  }

  private getEventTopic(
    topic: Topic | undefined,
    event: Omit<PrismeEvent, 'id'>
  ) {
    if (this.forceTopic) {
      return this.forceTopic;
    }
    if (!topic) {
      return event.type;
    }

    switch (topic) {
      case NativeTopic.WorkspaceUser:
        if (!event.source.workspaceId || !event.source.userId) {
          throw new Error(
            'Cant use workspace user topic without source.correlationId or source.userId defined !'
          );
        }

        return `topic:workspace:${event.source.workspaceId!!}:user:${event
          .source.userId!!}:`;
      case NativeTopic.WorkspaceId:
        if (!event.source.workspaceId) {
          throw new Error(
            'Cant use workspace topic without source.workspaceId defined !'
          );
        }
        return `topic:workspaceId:${event.source.workspaceId!!}`;
      default:
        return topic as string;
    }
  }

  async send<PayloadType extends object = object>(
    eventType: string,
    payload: PayloadType,
    partialSource?: Partial<EventSource>,
    topic?: Topic
  ) {
    const overrideSource =
      payload instanceof Error ? (<any>payload).source : partialSource;
    const event = this.eventsFactory.create(
      eventType,
      payload,
      {
        ...this.parentSource,
        ...(overrideSource || {}),
        host: {
          replica: this.consumer.name,
          ...(partialSource?.host || {}),
          service: this.service,
        },
      },
      {
        validateEvent: this.validateEvents,
      }
    );
    event.source.topic = this.getEventTopic(topic, event);

    if (this._buffer) {
      this._buffer.push(event);
      return { type: 'buffered event' } as PrismeEvent;
    }
    return this.driver.send(event, event.source.topic);
  }

  async on<PayloadType extends object = object>(
    topic: Topic | Topic[],
    cb: EventCallback<CallbackContext, PayloadType>,
    subscriptionOpts?: Partial<SubscriptionOptions>
  ) {
    return this.driver.on(
      topic,
      async (event) => {
        return this.processEvent<PayloadType>(event, cb);
      },
      subscriptionOpts
    );
  }

  private async processEvent<PayloadType extends object = object>(
    event: PrismeEvent,
    cb: EventCallback<CallbackContext, PayloadType>
  ) {
    // From now on, make any broker send/rcv calls using same source as in this event
    const childBroker = this.child(event.source);

    try {
      const startTime = Date.now();
      const pickupDelay = startTime - new Date(event.createdAt).getTime();

      const CallbackContextCtor = this.CallbackContextCtor;
      const callbackContext = CallbackContextCtor
        ? new CallbackContextCtor(event)
        : undefined;

      const mightBePromiseResult = cb(
        <any>event,
        childBroker,
        <any>callbackContext
      );
      const result =
        mightBePromiseResult instanceof Promise
          ? await mightBePromiseResult
          : mightBePromiseResult;

      if (!!result && this.onProcessedEventCallback) {
        this.onProcessedEventCallback(event, {
          procesDuration: Date.now() - startTime,
          pickupDelay,
        });
      }
      return result;
    } catch (error) {
      childBroker.send('error', error as any);
      if (this.onErrorCallback) {
        this.onErrorCallback(event, <Error>error);
      }
      return false;
    }
  }

  async all<PayloadType extends object = object>(
    cb: EventCallback<CallbackContext, PayloadType>,
    subscriptionOpts?: Partial<SubscriptionOptions>
  ) {
    return this.driver.all(async (event) => {
      return this.processEvent<PayloadType>(event, cb);
    }, subscriptionOpts);
  }

  pending() {
    return this.driver.pending();
  }

  async close() {
    return this.driver.close();
  }
}
