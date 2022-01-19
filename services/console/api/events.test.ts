import getConfig from "next/config";
import Events from "./events";
import io from "socket.io-client";

const { publicRuntimeConfig } = getConfig();

jest.mock("socket.io-client", () => {
  const mock = {
    disconnect: jest.fn(),
    onAny: jest.fn(),
    offAny: jest.fn(),
  };
  const io = jest.fn(() => mock);
  return io;
});

it("should connect to Websocket", () => {
  const client = new Events("1");
  expect(io).toHaveBeenCalledWith(
    `${publicRuntimeConfig.API_HOST || ""}/workspaces/1/events`,
    {
      withCredentials: true,
    }
  );
});

it("should disconnect to Websocket", () => {
  const client = new Events("1");
  client.destroy();
  expect(io().disconnect).toHaveBeenCalled();
});

it("should listen to all events", () => {
  const client = new Events("1");
  const listener = () => null;
  const off = client.all(listener);
  expect(io().onAny).toHaveBeenCalledWith(listener);
  off();
  expect(io().offAny).toHaveBeenCalledWith(listener);
});
