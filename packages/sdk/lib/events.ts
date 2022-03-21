import io, { Socket } from 'socket.io-client';
import { EventsFilters } from './types';

export class Events {
  private client: Socket;
  public workspaceId: string;
  private filters: EventsFilters;

  constructor(
    workspaceId: string,
    token: string,
    apiHost: string = 'https://api.eda.prisme.ai',
    filters: EventsFilters
  ) {
    this.workspaceId = workspaceId;
    this.client = io(`${apiHost}/workspaces/${workspaceId}/events`, {
      extraHeaders: {
        'x-prismeai-session-token': token,
      },
      query: filters,
    });
    this.filters = filters;
  }

  destroy() {
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
}

export default Events;
