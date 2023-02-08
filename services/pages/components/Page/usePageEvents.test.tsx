import renderer, { act } from 'react-test-renderer';
import api, { Events } from '../../../console/utils/api';
import usePageEvents from './usePageEvents';

jest.mock('next/router', () => {
  const mock = {
    push: jest.fn(),
  };
  return {
    useRouter() {
      return mock;
    },
  };
});
const events = ({
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

  await act(async () => {
    await root.update(<T page={{ ...page, workspaceId: '43' }} />);
  });

  expect(expected.events.destroy).toHaveBeenCalled();
});
