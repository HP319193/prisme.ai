import renderer, { act } from 'react-test-renderer';
import api, { Events } from '../../../console/utils/api';
import usePageEvents from './usePageEvents';

const offMock = jest.fn();
const eventsListeners: any[] = [];
const events = ({
  all: jest.fn((cb) => {
    eventsListeners.push(cb);
    return offMock;
  }),
  listenTopics: jest.fn(),
  emit: jest.fn(),
  destroy: jest.fn(),
} as any) as Events;

it('should set events for page', async () => {
  api.streamEvents = jest.fn(async () => events);
  api.callAutomation = jest.fn(async () => {});
  const page = {
    workspaceId: '42',
    name: 'Foo',
    blocks: [
      {
        name: 'Header',
        config: {
          foo: 'bar',
          updateOn: 'updateBlock',
          automation: 'initBlock',
        },
      },
    ],
  };
  let expected: any = {};
  const T = ({ page }: any) => {
    expected = usePageEvents(page);
    return null;
  };
  const root = renderer.create(<T page={page} />);
  await act(async () => {
    return;
  });
  expect(expected.blocksConfigs).toEqual([
    {
      foo: 'bar',
      updateOn: 'updateBlock',
      automation: 'initBlock',
    },
  ]);

  expect(expected.events).toBe(events);
  expect(expected.events.all).toHaveBeenCalled();
  expect(eventsListeners.length).toBe(1);

  eventsListeners[0]('updateBlock', { payload: { userTopics: 'foo' } });
  expect(events.listenTopics).toHaveBeenCalled();
  expect(api.callAutomation).toHaveBeenCalledWith('42', 'initBlock');

  await act(async () => {
    await root.update(<T page={{ ...page, workspaceId: '43' }} />);
  });

  expect(expected.events.destroy).toHaveBeenCalled();
  expect(offMock).toHaveBeenCalled();
});
