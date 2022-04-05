import { BrokerError, EventValidationError } from '../errors';
import { uniqueId } from '../utils';
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
  workspaceId?: string;
  host?: Host;
  correlationId?: string;
  topic?: Topic;
}

export interface PrismeEvent<T extends object = object> {
  type: string;
  source: EventSource;
  payload?: T;
  error?: { message: string } | BrokerError;
  createdAt: string;
  id: string;
}

export interface EventsFactoryOptions {
  validator: ValidatorOptions;
}

export interface CreateEventOptions {
  validateEvent: boolean;
}

// Must be in sync with SLUG_VALIDATION_REGEXP variable inside workspaces config
// TODO move to a shared utils package
const EVENT_NAMES_REGEXP = new RegExp('^[a-zA-Z0-9 _-]*$');

export class EventsFactory {
  public ready: Promise<any>;

  constructor({ validator }: EventsFactoryOptions) {
    this.ready = initValidator(validator);
  }

  create(
    eventType: string,
    payload: object,
    partialSource: Partial<EventSource>,
    { validateEvent }: CreateEventOptions
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
          ? { error: (payload as BrokerError).toJSON() }
          : {
              error: {
                message: payload.message,
              },
            }
        : { payload };

    const source = Object.assign(
      {},
      partialSource,
      !partialSource?.correlationId ? { correlationId: uniqueId() } : undefined
    );

    return {
      type: eventType,
      source,
      createdAt: new Date().toISOString(),
      ...data,
    };
  }
}
