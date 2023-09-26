import io, { Socket } from 'socket.io-client';

import { Api } from './api';

export type PayloadQuery = Record<string, string | string[]>;
export type OrQuery = PayloadQuery[];

export type SearchOptions = Omit<
  PrismeaiAPI.EventsLongpolling.QueryParameters,
  'query' | 'types'
> & {
  payloadQuery?: PayloadQuery | OrQuery;
  types?: string[];
};

export class Events {
  protected client: Socket;
  public workspaceId: string;
  private filters: Record<string, any>[];
  private listenedUserTopics: Map<string, string[]>;
  private listeners: Map<string, Function[]> = new Map();
  private lastReceivedEventDate: Date;
  private socketId?: string;

  constructor({
    workspaceId,
    token,
    legacyToken,
    apiKey,
    apiHost = 'https://api.eda.prisme.ai',
    filters,
    api,
  }: {
    workspaceId: string;
    token: string;
    legacyToken?: string;
    apiKey?: string;
    apiHost?: string;
    filters?: Record<string, any>;
    api: Api;
  }) {
    this.workspaceId = workspaceId;
    const queryString = new URLSearchParams(filters || {}).toString();
    const fullQueryString = queryString ? `?${queryString}` : '';
    const extraHeaders: any = token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : { 'x-prismeai-token': legacyToken };
    this.lastReceivedEventDate = new Date();
    if (apiKey) {
      extraHeaders['x-prismeai-api-key'] = apiKey;
    }

    this.client = io(
      `${apiHost}/workspaces/${workspaceId}/events${fullQueryString}`,
      {
        extraHeaders,
        withCredentials: true,
      }
    );

    const onConnect = () => {
      // First connection
      if (!this.socketId) {
        this.socketId = this.client.id;
        return;
      }

      // Reconnection : Reset last filters, retrieve lost history & sent previous socketId
      this.client.emit('reconnection', { socketId: this.socketId });
      this.updateFilters({
        payloadQuery: this.filters,
      });
      setTimeout(async () => {
        const events = await api.getEvents(workspaceId, {
          ...this.filters[this.filters.length - 1],
          afterDate: this.lastReceivedEventDate.toISOString(),
        });
        events.reverse().forEach((event) => {
          (this.listeners.get(event.type) || []).forEach((listener) =>
            listener(event)
          );
        });
      }, 2000);
    };
    this.client.on('connect', onConnect);

    this.client.on('disconnect', () => {
      if (!this.lastReceivedEventDate) {
        this.lastReceivedEventDate = new Date();
      }
      this.client.off('connect', onConnect);
      this.client.on('connect', onConnect);
    });

    this.filters = [filters || {}];
    this.listenedUserTopics = new Map();
  }

  get socket() {
    return this.client;
  }

  destroy() {
    this.workspaceId = '';

    if (this.client.connected) {
      this.client.disconnect();
      return;
    }
    this.client.once('connect', () => {
      this.client.disconnect();
    });
  }

  all(listener: (eventName: string, eventData: Prismeai.PrismeEvent) => void) {
    this.client.onAny((eventName: string, eventData: Prismeai.PrismeEvent) => {
      this.lastReceivedEventDate = new Date(eventData?.createdAt);
      return listener(eventName, eventData);
    });

    return () => this.client.offAny(listener);
  }

  on(ev: string, listener: (eventData: Prismeai.PrismeEvent) => void) {
    this.listeners.set(ev, [...(this.listeners.get(ev) || []), listener]);

    this.client.on(ev, listener);
    return () => {
      this.listeners.set(
        ev,
        (this.listeners.get(ev) || []).filter((l) => l !== listener)
      );
      this.client.off(ev, listener);
    };
  }

  emit(event: string, payload?: any, options?: any) {
    this.client.emit('event', {
      type: event,
      payload,
      options,
    });
  }

  listenTopics({
    event,
    topics,
  }: {
    event: string;
    topics: string | string[];
  }) {
    topics = Array.isArray(topics) ? topics : [topics];

    this.listenedUserTopics.set(event, topics);

    this.filters = [
      { ...this.filters[0] },
      {
        'target.userTopic': Array.from(this.listenedUserTopics).flatMap(
          ([_event, topics]) => topics
        ),
      },
    ];
    this.updateFilters({
      payloadQuery: this.filters,
    });
  }

  updateFilters(filters: SearchOptions) {
    this.client.emit('filters', filters);
  }

  once(
    ev: string,
    listener: (eventName: string, eventData: Prismeai.PrismeEvent) => void
  ) {
    this.client.once(ev, listener);
    return () => {
      this.client.off(ev, listener);
    };
  }

  close() {
    this.client.close();
  }
}

export default Events;
