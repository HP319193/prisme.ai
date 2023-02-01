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
  private listenedUserTopics: Set<string>;
  private listeners: Map<string, Function[]> = new Map();

  constructor({
    workspaceId,
    token,
    apiKey,
    apiHost = 'https://api.eda.prisme.ai',
    filters,
    api,
  }: {
    workspaceId: string;
    token: string;
    apiKey?: string;
    apiHost?: string;
    filters?: Record<string, any>;
    api: Api;
  }) {
    this.workspaceId = workspaceId;
    const queryString = new URLSearchParams(filters || {}).toString();
    const fullQueryString = queryString ? `?${queryString}` : '';
    const extraHeaders: any = {
      'x-prismeai-token': token,
    };
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

    let lastConnectionTime = new Date();
    const onConnect = () => {
      setTimeout(async () => {
        const events = await api.getEvents(workspaceId, {
          ...this.filters[this.filters.length - 1],
          afterDate: lastConnectionTime.toISOString(),
        });
        events.reverse().forEach((event) => {
          (this.listeners.get(event.type) || []).forEach((listener) =>
            listener(event)
          );
        });
      }, 2000);
    };
    this.client.on('disconnect', () => {
      lastConnectionTime = new Date();
      this.client.off('connect', onConnect);
      this.client.on('connect', onConnect);
    });

    this.filters = [filters || {}];
    this.listenedUserTopics = new Set();
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
    this.client.onAny(listener);

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

  listenTopics(topics: string | string[]) {
    topics = Array.isArray(topics) ? topics : [topics];

    const initialTopicsNb = this.listenedUserTopics.size;
    topics.forEach((topic) => {
      this.listenedUserTopics.add(topic);
    });
    if (initialTopicsNb === this.listenedUserTopics.size) {
      return;
    }

    this.filters = [
      { ...this.filters[0] },
      {
        'target.userTopic': Array.from(this.listenedUserTopics),
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
