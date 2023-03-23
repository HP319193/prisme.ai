import { BrokerError, EventValidationError } from '../errors';
import { isPrivateIP, uniqueId } from '../utils';
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
  createdAt: string;
  id: string;
  size: number;
}

export interface EventsFactoryOptions {
  validator: ValidatorOptions;
}

export interface CreateEventOptions {
  validateEvent: boolean;
  additionalFields?: any;
}

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

  create(
    eventType: string,
    payload: object,
    partialSource: Partial<EventSource>,
    { validateEvent, additionalFields }: CreateEventOptions
  ): Omit<PrismeEvent, 'id'> {
    if (!EVENT_NAMES_REGEXP.test(eventType)) {
      throw new EventValidationError(
        `Invalid event name '${eventType}' : only allowed characters are letters, numbers, whitespaces, . _ and -`,
        { event: eventType }
      );
    }
    if (validateEvent && !(payload instanceof Error)) {
      validate(eventType, payload);
    }
    const data =
      payload instanceof Error
        ? (payload as BrokerError).toJSON
          ? { payload: (payload as BrokerError).toJSON() }
          : {
              payload: {
                message: payload.message,
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

    if (
      this.validatorOpts?.redactPrivateIps &&
      event?.source?.ip &&
      isPrivateIP(event?.source?.ip)
    ) {
      delete event.source.ip;
    }

    return event;
  }
}
