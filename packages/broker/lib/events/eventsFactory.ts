import { BrokerError } from '../errors';
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

export enum NativeTopic {
  WorkspaceUser = 'correlationId',
  WorkspaceId = 'workspaceId',
}

export type Topic = NativeTopic | string;
export interface EventSource {
  appId?: string;
  appInstanceSlug?: string;
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

export class EventsFactory {
  public ready: Promise<any>;

  constructor({ validator }: EventsFactoryOptions) {
    this.ready = initValidator(validator);
  }

  create(
    eventType: string,
    payload: object,
    partialSource: Partial<EventSource> &
      Pick<EventSource, 'appId' | 'appInstanceSlug'>
  ): Omit<PrismeEvent, 'id'> {
    if (!(payload instanceof Error)) {
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
