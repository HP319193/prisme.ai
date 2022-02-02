import getConfig from 'next/config';
import io, { Socket } from 'socket.io-client';

const { publicRuntimeConfig } = getConfig();

export class Events {
  private client: Socket;
  constructor(workspaceId: string) {
    this.client = io(
      `${publicRuntimeConfig.API_HOST || ''}/workspaces/${workspaceId}/events`,
      {
        withCredentials: true,
      }
    );
  }

  destroy() {
    this.client.disconnect();
  }

  all(listener: (eventName: string, eventData: Prismeai.PrismeEvent) => void) {
    this.client.onAny(listener);

    return () => this.client.offAny(listener);
  }
}

export default Events;
