import { BrokerError, EventValidationError } from '../errors';
import { isPrivateIP, redact, uniqueId } from '../utils';
import { init as initValidator, validate, ValidatorOptions } from './validator';

export interface Consumer {
  service: string;
  name: string;
}
export interface Host {
  replica?: string;
  service: string;
}

export type Topic = string;
export interface EventSource {
  appSlug?: string;
  appInstanceFullSlug?: string;
  appInstanceDepth?: number;
  automationSlug?: string;
  userId?: string;
  ip?: string;
  sessionId?: string;
  workspaceId?: string;
  socketId?: string;
  host?: Host;
  correlationId?: string;
  serviceTopic?: Topic;
  automationDepth?: number;
}

export interface PrismeEvent<T extends object = object> {
  type: string;
  source: EventSource;
  payload?: T;
  error?: { message: string } | BrokerError;
  options?: {
    persist?: boolean;
  };
  target?: {
    userTopic?: string;
    userId?: string;
    sessionId?: string;
    /**
     * If emitted in response to an active socket (i.e source.socketId is set), this event is only visible to this same socket. Defaults to true
     */
    currentSocket?: boolean;
  };
  createdAt: string;
  id: string;
  size: number;
}

export interface EventsFactoryOptions {
  validator: ValidatorOptions;
}

export type FormatEventOptions = {
  exceedingSizeLimit?: {
    redact?: string[];
    replaceWith?: any;
  };
};

export type CreateEventOptions = FormatEventOptions & {
  validateEvent: boolean;
  additionalFields?: any;
};

// Must be in sync with SLUG_VALIDATION_REGEXP variable inside workspaces config
// TODO move to a shared utils package
const EVENT_NAMES_REGEXP = new RegExp('^[a-zA-Z0-9 ._-]*$');

export class EventsFactory {
  public ready: Promise<any>;
  private validatorOpts: ValidatorOptions;

  constructor({ validator }: EventsFactoryOptions) {
    this.ready = initValidator(validator);
    this.validatorOpts = {
      redactPrivateIps: true,
      ...validator,
    };
  }

  // This must not throw, so we can safely use it to emit errors in last resort
  safeFormat(
    eventType: string,
    payload: object,
    partialSource: Partial<EventSource>,
    { additionalFields, exceedingSizeLimit }: CreateEventOptions
  ): PrismeEvent {
    const data =
      payload instanceof Error
        ? (payload as BrokerError).toJSON
          ? { payload: (payload as BrokerError).toJSON() }
          : {
              payload: {
                message: payload.message,
                error: (<any>payload).error,
              },
            }
        : { payload };

    const source = Object.assign(
      {},
      partialSource,
      !partialSource?.correlationId ? { correlationId: uniqueId() } : undefined
    );

    const event: PrismeEvent = {
      ...additionalFields,
      type: eventType,
      source,
      createdAt: new Date().toISOString(),
      ...data,
    };
    event.size = JSON.stringify(event).length;

    if (typeof event?.source?.ip === 'string') {
      // x-forwarded-for http header might have multiple forwarded ip, comma separated
      if (event?.source?.ip.includes(',')) {
        event.source.ip = event?.source?.ip.split(',')[0];
      }
      if (
        this.validatorOpts?.redactPrivateIps &&
        isPrivateIP(event?.source?.ip)
      ) {
        delete event.source.ip;
      }
    }

    if (
      this.validatorOpts?.eventsMaxLen &&
      event.size > this.validatorOpts?.eventsMaxLen &&
      exceedingSizeLimit?.redact?.length
    ) {
      redact(
        event,
        exceedingSizeLimit?.redact.map((field) => `payload.${field}`),
        'replaceWith' in exceedingSizeLimit
          ? exceedingSizeLimit.replaceWith
          : 'LARGE_CONTENT_STRIPPED'
      );
      event.size = JSON.stringify(event).length;
    }
    return event;
  }

  create(
    eventType: string,
    payload: object,
    partialSource: Partial<EventSource>,
    opts: CreateEventOptions
  ): Omit<PrismeEvent, 'id'> {
    const { validateEvent } = opts;
    if (!EVENT_NAMES_REGEXP.test(eventType)) {
      throw new EventValidationError(
        `Invalid event name '${eventType}' : only allowed characters are letters, numbers, whitespaces, . _ and -`,
        { event: eventType }
      );
    }
    if (validateEvent && !(payload instanceof Error)) {
      validate(eventType, payload);
    }

    const event = this.safeFormat(eventType, payload, partialSource, opts);

    if (this.validatorOpts?.eventsMaxLen) {
      if (event.size > this.validatorOpts?.eventsMaxLen) {
        throw new EventValidationError(
          `Event '${eventType}' too large : ${event.size} bytes exceeds the maximum authorized limit (${this.validatorOpts?.eventsMaxLen})`,
          {
            reason: 'EventTooLarge',
            eventType,
            eventSize: event.size,
            maxSize: this.validatorOpts?.eventsMaxLen,
            source: {
              workspaceId: event?.source?.workspaceId,
              correlationId: event?.source?.correlationId,
              userId: event?.source?.userId,
              sessionId: event?.source?.sessionId,
            },
          }
        );
      }
    }

    return event;
  }
}
