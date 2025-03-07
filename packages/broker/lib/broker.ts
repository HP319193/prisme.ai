import {
  Consumer,
  EventsFactory,
  FormatEventOptions,
  EventSource,
  PrismeEvent,
  Topic,
} from './events';
import {
  driver,
  Driver,
  DriverOptions,
  SubscriptionOptions,
  DriverSendOptions,
} from './drivers';
import { ValidatorOptions } from './events/validator';
import { EventValidationError } from './errors';

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

export type SendOptions = FormatEventOptions &
  DriverSendOptions & {
    throwErrors?: boolean;
    disableValidation?: boolean;
  };

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
  public beforeSendEventCallback?: (event: Omit<PrismeEvent, 'id'>) => void;

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
    newParentSource: Partial<EventSource>,
    opts?: {
      validateEvents?: boolean;
      forceTopic?: string;
      clearUser?: boolean;
      buffer?: boolean;
    }
  ): Broker<CallbackContext> {
    // Some source metadata should not persist in child brokers
    const {
      ip: _,
      serviceTopic: __,
      ...previousParentSource
    } = this.parentSource;
    const childSource = {
      ...previousParentSource,
      ...newParentSource,
      userId: opts?.clearUser
        ? undefined
        : newParentSource.userId || previousParentSource.userId,
    };
    // We never want to keep serviceTopic from given sources. In order to set a topic, use "this.forceTopic" or send partial source parameter
    delete childSource.serviceTopic;

    const child = Object.assign({}, this, {
      parentSource: childSource,
      _buffer: false,
      ...opts,
    });
    Object.setPrototypeOf(child, Broker.prototype);
    if (opts?.buffer) {
      (child as Broker)._buffer = [];
    }
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
      this.driver.send(event, event.source.serviceTopic!)
    );
    this._buffer = disableBuffer ? false : [];
    return await Promise.all(results);
  }

  clear(disableBuffer?: boolean) {
    this._buffer = disableBuffer ? false : [];
  }

  private getEventTopic(event: Omit<PrismeEvent, 'id'>) {
    if (this.forceTopic) {
      return this.forceTopic;
    }
    if (event?.source?.serviceTopic) {
      return event?.source?.serviceTopic;
    }
    return event.type;
  }

  async send<PayloadType extends object = object>(
    eventType: string,
    payload: PayloadType,
    partialSource?: Partial<EventSource>,
    additionalFields?: any,
    // Legacy usage : opts was instead a 'throwErrors: boolean'
    // TODO Remove boolean handling when every calling code have been fixed
    opts?: boolean | SendOptions
  ): Promise<PrismeEvent | false> {
    const {
      throwErrors = false,
      disableValidation = false,
      disableCatchAll = false,
      ...formatOpts
    } = (typeof opts === 'boolean' ? { throwErrors: opts } : opts) || {};

    if (!eventType) {
      throw new EventValidationError('Empty event type', { payload });
    }
    const overrideSource =
      payload instanceof Error ? (<any>payload).source : partialSource;
    let event: Omit<PrismeEvent, 'id'>;
    const source = {
      ...this.parentSource,
      ...(overrideSource || {}),
      host: {
        replica: this.consumer.name,
        ...(partialSource?.host || {}),
        service: this.service,
      },
    };
    try {
      event = this.eventsFactory.create(eventType, payload, source, {
        validateEvent: !disableValidation && this.validateEvents,
        additionalFields,
        ...formatOpts,
      });
    } catch (err) {
      if (throwErrors) {
        throw err;
      } else {
        (<any>err).source = source;
        const errEvent = this.eventsFactory.safeFormat(
          'error',
          err as any,
          source,
          {
            validateEvent: false,
            additionalFields,
          }
        );
        this.driver.send(errEvent, source.serviceTopic || 'error').catch();
      }
      console.error({
        level: 50,
        time: Date.now(),
        err,
        details: (<any>err).details,
        event: {
          type: eventType,
          payload: JSON.stringify(payload),
        },
      });
      return Promise.resolve(false);
    }
    event.source.serviceTopic = this.getEventTopic(event);

    if (this.beforeSendEventCallback) {
      this.beforeSendEventCallback(event);
    }

    if (this._buffer) {
      this._buffer.push(event);
      return { type: 'buffered event' } as PrismeEvent;
    }
    return this.driver.send(event, event.source.serviceTopic, {
      disableCatchAll,
    });
  }

  async on<PayloadType extends object = object>(
    topic: Topic | Topic[],
    cb: EventCallback<CallbackContext, PayloadType>,
    subscriptionOpts?: Partial<SubscriptionOptions>
  ) {
    return this.driver.on(
      topic,
      async (event) => {
        if (!event) {
          // timeouts
          return cb(<any>null, this, <any>null);
        }
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
    const { serviceTopic: _, ...childSource } = event.source; // We do not want serviceTopic to be spread in childparentSource
    const childBroker = this.child(childSource, { clearUser: true });

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
  async setExpiration(topic: string, ttl: number) {
    return this.driver.setExpiration(topic, ttl);
  }
}
