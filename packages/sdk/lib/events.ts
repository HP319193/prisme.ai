import io, { Socket } from 'socket.io-client';

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
  private filters: Record<string, any>;
  private listenedUserTopics: Set<string>;

  constructor({
    workspaceId,
    token,
    apiKey,
    apiHost = 'https://api.eda.prisme.ai',
    filters,
  }: {
    workspaceId: string;
    token: string;
    apiKey?: string;
    apiHost?: string;
    filters?: Record<string, any>;
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

    this.client.on('disconnect', () => {
      setTimeout(() => {
        this.client.connect();
      }, 2000);
    });

    this.filters = filters || {};
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

  on(
    ev: string,
    listener: (eventName: string, eventData: Prismeai.PrismeEvent) => void
  ) {
    this.client.on(ev, listener);
    return () => this.client.off(ev, listener);
  }

  emit(event: string, payload?: any) {
    this.client.emit('event', {
      type: event,
      payload,
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

    const topicsFilter = {
      'target.userTopic': Array.from(this.listenedUserTopics),
    };
    this.updateFilters({
      payloadQuery: Object.keys(this.filters).length
        ? [this.filters, topicsFilter]
        : topicsFilter,
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
  }

  close() {
    this.client.close();
  }
}

export default Events;
