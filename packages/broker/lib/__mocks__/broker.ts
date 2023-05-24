import { EventSource, Topic, EventsFactory, Consumer } from '@prisme.ai/broker';
import path from 'path';
import { PrismeEvent } from '../events';

type EventCallback = (event: PrismeEvent, broker: Broker, opts: any) => any;

export default class Broker {
  private consumer: Consumer;
  private running: boolean;
  private events: PrismeEvent[];
  private delay: number;
  private eventsFactory: EventsFactory;
  private service: string;
  private forceTopic?: string;
  public parentSource: Partial<EventSource>;

  private callbacks: Record<Topic, EventCallback[]>;

  public beforeSendEventCallback?: (event: Omit<PrismeEvent, 'id'>) => void;

  constructor(delay: number = 25) {
    this.running = false;
    this.events = [];
    this.delay = delay;
    this.callbacks = {};
    this.consumer = {
      name: 'broker',
      service: 'prismeai-runtime',
    };
    this.eventsFactory = new EventsFactory({
      validator: {
        oasFilepath:
          process.env.EVENTS_OAS_PATH ||
          path.resolve(__dirname, '../../openapi/events.yml'),
        whitelistEventPrefixes: [''],
      },
    });
    this.service = this.consumer.service;
    this.parentSource = {};
  }

  async start() {
    this.running = true;
    while (this.running) {
      const event = this.events.shift();
      if (event) {
        const callbacks = this.callbacks[event.source.serviceTopic!];
        if (callbacks) {
          for (const cb of callbacks) {
            // We do not want serviceTopic to be spread in childparentSource
            const { serviceTopic: _, ...childSource } = event.source;
            const childBroker = this.child(childSource);
            try {
              await cb(event, childBroker, {
                logger: console,
              });
            } catch (error) {
              childBroker.send('error', error as any);
            }
          }
        }
      }
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }
  }

  child(
    parentSource: Partial<EventSource>,
    opts?: {
      validateEvents: boolean;
      forceTopic?: string;
    }
  ): Broker {
    const child = Object.assign({}, this, {
      parentSource: {
        ...this.parentSource,
        ...parentSource,
        userId: parentSource.userId || this.parentSource.userId,
        workspaceId: parentSource.workspaceId || this.parentSource.workspaceId,
        correlationId:
          parentSource.correlationId || this.parentSource.correlationId,
      },
      ...opts,
    });
    Object.setPrototypeOf(child, Broker.prototype);
    return child;
  }

  close() {
    this.running = false;
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
    throwErrors?: boolean
  ) {
    const overrideSource =
      payload instanceof Error ? (<any>payload).source : partialSource;
    let event: PrismeEvent;
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
        validateEvent: false,
        additionalFields,
      }) as PrismeEvent;
      (<any>event).id = `${eventType}-${Math.random() * 10000}`;
      event.source.serviceTopic = this.getEventTopic(event);
      this._send(event);
    } catch (err) {
      if (throwErrors) {
        throw err;
      } else {
        (<any>err).source = source;
        let errEvent = this.eventsFactory.safeFormat(
          'error',
          err as any,
          source,
          {
            validateEvent: false,
            additionalFields,
          }
        );
        (<any>errEvent).id = `error-${Math.random() * 10000}`;
        errEvent.source.serviceTopic = 'error';
        this._send(errEvent);
      }
      return Promise.resolve(false);
    }

    return Promise.resolve(event);
  }

  _send(event: PrismeEvent) {
    if (this.beforeSendEventCallback) {
      this.beforeSendEventCallback(event);
    }
    this.events.push(event);
  }

  async on(topic: Topic | Topic[], cb: EventCallback) {
    const topics = Array.isArray(topic) ? topic : [topic];
    for (const topic of topics) {
      if (!this.callbacks[topic]) {
        this.callbacks[topic] = [];
      }
      this.callbacks[topic].push(cb);
    }
  }

  async buffer() {}
  async flush() {}
}
