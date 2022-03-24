import io, { Socket } from 'socket.io-client';
import { EventsFilters } from '@prisme.ai/types/additional';

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
      // TODO add filters too query when workspaces service handles it
      // query: filters,
    });
    this.filters = filters;
  }

  destroy() {
    this.workspaceId = '';
    this.filters = {};

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
