import renderer, { act } from 'react-test-renderer';
import { userContext } from '../../../console/components/UserProvider';
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
const events = {
  destroy: jest.fn(),
  once: jest.fn(),
} as any as Events;

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
  const root = renderer.create(
    <userContext.Provider value={{ user: {} } as any}>
      <T page={page} />
    </userContext.Provider>
  );
  await act(async () => {
    return;
  });

  expect(expected.events).toBe(events);

  await act(async () => {
    await root.update(
      <userContext.Provider value={{ user: {} } as any}>
        <T page={{ ...page, workspaceId: '43' }} />
      </userContext.Provider>
    );
  });

  expect(expected.events.destroy).toHaveBeenCalled();
});
