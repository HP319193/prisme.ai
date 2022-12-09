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
    streamEvents: jest.fn(() => ({
      all: jest.fn(() => mockEvent),
    })),
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
    await true;
  });
  expect(api.streamEvents).toHaveBeenCalledWith('42', {});
  jest.runAllTimers();
  await act(async () => {
    await true;
  });

  const getEvents = api.getEvents as jest.Mock;
  expect(getEvents).toHaveBeenCalledWith('42', { limit: 50, page: 0 });
  getEvents.mockClear();

  await act(async () => {
    const p = await context.fetchNextEvents();
    console.log(p);
  });
  expect(getEvents).toHaveBeenCalledWith('42', { limit: 50, page: 1 });
});
