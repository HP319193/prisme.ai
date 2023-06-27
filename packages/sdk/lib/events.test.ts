import getConfig from 'next/config';
import Events from './events';
import io from 'socket.io-client';
import { Api } from './api';

jest.mock('socket.io-client', () => {
  const mock = {
    disconnect: jest.fn(),
    onAny: jest.fn(),
    offAny: jest.fn(),
    on: jest.fn(),
    once: jest.fn(),
  };
  const io = jest.fn(() => mock);
  return io;
});

it('should connect to Websocket', () => {
  new Events({ workspaceId: '1', token: 'abcde', api: {} as Api });
  expect(io).toHaveBeenCalledWith(
    `https://api.eda.prisme.ai/workspaces/1/events`,
    {
      extraHeaders: {
        Authorization: 'Bearer abcde',
      },
      withCredentials: true,
    }
  );
});

it('should connect to Websocket with apiKey', () => {
  new Events({
    workspaceId: '1',
    token: 'abcde',
    apiKey: 'fghij',
    api: {} as Api,
  });
  expect(io).toHaveBeenCalledWith(
    `https://api.eda.prisme.ai/workspaces/1/events`,
    {
      extraHeaders: {
        Authorization: 'Bearer abcde',
        'x-prismeai-api-key': 'fghij',
      },
      withCredentials: true,
    }
  );
});

it('should disconnect to Websocket', () => {
  const client = new Events({
    workspaceId: '1',
    token: 'abcde',
    api: {} as Api,
  });
  (client as any).client.connected = true;
  client.destroy();
  expect(io().disconnect).toHaveBeenCalled();
});

it('should wait before disconnecting Websocket', () => {
  const client = new Events({
    workspaceId: '1',
    token: 'abcde',
    api: {} as Api,
  });
  const ioInstance = io();
  (client as any).client.connected = false;
  ((client as any).client.once as jest.Mock).mockClear();
  ioInstance.disconnect = jest.fn();
  client.destroy();
  expect(ioInstance.disconnect).not.toHaveBeenCalled();
  expect((client as any).client.once).toHaveBeenCalled();
  ((client as any).client.once as jest.Mock).mock.calls[0][1]();
  expect(ioInstance.disconnect).toHaveBeenCalled();
});

it('should listen to all events', () => {
  const client = new Events({
    workspaceId: '1',
    token: 'abcde',
    api: {} as Api,
  });
  const listener = () => null;
  const off = client.all(listener);
  expect(io().onAny).toHaveBeenCalledWith(listener);
  off();
  expect(io().offAny).toHaveBeenCalledWith(listener);
});
