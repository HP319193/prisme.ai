import renderer, { act } from 'react-test-renderer';
import api from '../../../console/utils/api';
import Page from './Page';
import { usePage } from './PageProvider';
import userContext from '../../../console/components/UserProvider/context';

window.Prisme = {
  ai: {
    debug: {},
  },
} as any;

jest.mock('next/router', () => {
  function useRouter() {
    return {
      push: jest.fn(),
    };
  }
  return {
    useRouter,
  };
});
jest.mock('./PageProvider', () => {
  const mock = {
    events: {
      emit: jest.fn(),
    },
    blocksConfigs: [],
  };
  return {
    usePage: () => mock,
  };
});

it('should render empty page', () => {
  const page: Parameters<typeof Page>[0]['page'] = {
    name: 'Foo',
    blocks: [],
    apiKey: '',
    slug: 'foo',
    appInstances: [],
  };
  const root = renderer.create(
    <userContext.Provider value={{} as any}>
      <Page page={page} />
    </userContext.Provider>
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render blocks', () => {
  const page: Parameters<typeof Page>[0]['page'] = {
    name: 'Foo',
    apiKey: '',
    slug: 'foo',
    appInstances: [],
    blocks: [
      {
        slug: 'Header',
      },
      {
        slug: 'RichText',
      },
    ],
  };
  const root = renderer.create(
    <userContext.Provider value={{} as any}>
      <Page page={page} />
    </userContext.Provider>
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should add JS API in window object', () => {
  const { events } = usePage();
  const page: Parameters<typeof Page>[0]['page'] = {
    name: 'Foo',
    apiKey: '',
    slug: 'foo',
    appInstances: [],
    blocks: [],
  };
  const root = renderer.create(
    <userContext.Provider value={{} as any}>
      <Page page={page} />
    </userContext.Provider>
  );

  act(() => {
    return;
  });
  expect(window.Prisme.ai.api).toBe(api);
  expect(window.Prisme.ai.events).toBe(events);
});
