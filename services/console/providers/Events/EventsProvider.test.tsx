import renderer, { act } from 'react-test-renderer';
import { workspaceContext } from '../Workspace';
import workspaceContextValue from '../Workspace/workspaceContextValue.mock';
import api from '../../utils/api';
import { EventsContext, EventsProvider, useEvents } from './EventsProvider';

jest.useFakeTimers();

jest.mock('../../utils/api', () => {
  const mockEvent = {
    all: jest.fn(),
    destroy: jest.fn(),
  };
  const mock = {
    mockEvent,
    getEvents: jest.fn(() => []),
    streamEvents: jest.fn(() => mockEvent),
  };
  return mock;
});

it('should render', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <EventsProvider workspaceId={workspaceContextValue.workspace.id}>
        Foo
      </EventsProvider>
    </workspaceContext.Provider>
  );
  expect(root.toJSON()).toMatchSnapshot();
});

let context: EventsContext;
const T = () => {
  context = useEvents();
  return null;
};

it('should fetch', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <EventsProvider workspaceId={workspaceContextValue.workspace.id}>
        <T />
      </EventsProvider>
    </workspaceContext.Provider>
  );

  await act(async () => {
    jest.runAllTimers();
    await true;
  });

  const getEvents = api.getEvents as jest.Mock;
  expect(getEvents).toHaveBeenCalledWith('42', { limit: 50, page: 0 });
  getEvents.mockClear();

  await act(async () => {
    await context.fetchNextEvents();
  });
  expect(getEvents).toHaveBeenCalledWith('42', { limit: 50, page: 1 });
});

it('should init events', async () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <EventsProvider workspaceId={workspaceContextValue.workspace.id}>
        <T />
      </EventsProvider>
    </workspaceContext.Provider>
  );

  await act(async () => {
    await true;
  });

  expect(api.streamEvents).not.toHaveBeenCalled();

  await act(async () => {
    await context.start();
  });

  // api.streamEvents is no longer called on init, as it requires at least one filter
  // @TODO update the test with a filter
  expect(api.streamEvents).not.toHaveBeenCalled();
  await act(async () => {
    await context.stop();
  });

  // @ts-ignore
  // expect(api.mockEvent.destroy).toHaveBeenCalled();
});
