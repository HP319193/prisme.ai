import io, { Socket } from 'socket.io-client';

export class Events {
  private client: Socket;
  public workspaceId: string;

  constructor(
    workspaceId: string,
    token: string,
    apiHost: string = 'https://api.eda.prisme.ai'
  ) {
    this.workspaceId = workspaceId;
    this.client = io(`${apiHost}/workspaces/${workspaceId}/events`, {
      extraHeaders: {
        'x-prismeai-session-token': token,
      },
    });
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
}

export default Events;
