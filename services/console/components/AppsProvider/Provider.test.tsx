import Provider from './Provider';
import renderer, { act } from 'react-test-renderer';
import api from '../../utils/api';
import { useApps } from './context';

jest.mock('../WorkspacesProvider', () => {
  const mock = {
    user: {},
  };
  return {
    useUser: () => mock,
  };
});

beforeEach(() => {
  jest.resetAllMocks();
});

it('should access context', async () => {
  let context: any = {};
  const Test = () => {
    context = useApps();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  expect(context.apps).toEqual(new Map());
  expect(context.getApps).toBeInstanceOf(Function);
});

it('should fetch apps from store', async () => {
  jest.spyOn(api, 'getApps').mockReturnValue(
    Promise.resolve([
      {
        workspaceId: 'workspace1Id',
        versions: ['0'],
        name: 'App 1',
        slug: 'appId1',
      },
      {
        workspaceId: 'workspace2Id',
        versions: ['0'],
        name: 'App 2',
        slug: 'appId2',
      },
    ] as any)
  );
  let context: any = {};
  const Test = () => {
    context = useApps();
    return null;
  };
  const root = renderer.create(
    <Provider>
      <Test />
    </Provider>
  );
  await act(async () => {
    await context.getApps();
  });

  expect(api.getApps).toHaveBeenCalled();
  expect(context.apps).toEqual(
    new Map([
      [
        'appId1',
        {
          workspaceId: 'workspace1Id',
          versions: ['0'],
          name: 'App 1',
          slug: 'appId1',
        },
      ],
      [
        'appId2',
        {
          workspaceId: 'workspace2Id',
          versions: ['0'],
          name: 'App 2',
          slug: 'appId2',
        },
      ],
    ])
  );
});
