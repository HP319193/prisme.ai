import io, { Socket } from 'socket.io-client';

export class Events {
  protected client: Socket;
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
