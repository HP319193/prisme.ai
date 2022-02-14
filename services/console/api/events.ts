import getConfig from 'next/config';
import io, { Socket } from 'socket.io-client';

const { publicRuntimeConfig } = getConfig();

export class Events {
  private client: Socket;
  public workspaceId: string;

  constructor(workspaceId: string) {
    this.workspaceId = workspaceId;
    this.client = io(
      `${publicRuntimeConfig.API_HOST || ''}/workspaces/${workspaceId}/events`,
      {
        withCredentials: true,
      }
    );
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
