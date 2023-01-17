import renderer, { act } from 'react-test-renderer';
import BlockLoader from './BlockLoader';
import { usePage } from './PageProvider';

jest.mock('./PageProvider', () => {
  const mock = {
    page: {
      workspaceId: '42',
      appInstances: [
        {
          slug: 'Foo',
          appConfig: {},
          blocks: {
            'Foo.Block1': 'http://fooblock1',
            'Foo.Block2': 'http://fooblock2',
          },
        },
      ],
    },
    events: {
      emit: jest.fn(),
    },
  };
  return {
    usePage: () => mock,
  };
});

it('should render a builtin block', () => {
  const root = renderer.create(<BlockLoader name="RichText" />);
  const child = root.root.children[0] as renderer.ReactTestInstance;
  expect(child.props.name).toBe('RichText');
  expect(child.props.url).toBe('');
  expect(child.props.appConfig).not.toBeDefined();
  expect(child.props.language).toBe('en');
  expect(child.props.workspaceId).toBe('42');
  expect(child.props.config).not.toBeDefined();
});

it('should render an App block', () => {
  const { page } = usePage();
  const root = renderer.create(<BlockLoader name="Foo.Block1" />);

  act(() => {
    return;
  });

  const child = root.root.children[0] as renderer.ReactTestInstance;
  expect(child.props.name).toBe('Foo.Block1');
  expect(child.props.url).toBe('http://fooblock1');
  expect(child.props.appConfig).toBe(
    page && page.appInstances && page.appInstances[0].appConfig
  );
  expect(child.props.language).toBe('en');
  expect(child.props.workspaceId).toBe('42');
  expect(child.props.config).not.toBeDefined();
});

it('should render a custom block with url', () => {
  const root = renderer.create(<BlockLoader name="http://custom" />);

  act(() => {
    return;
  });

  const child = root.root.children[0] as renderer.ReactTestInstance;
  expect(child.props.name).toBe('http://custom');
  expect(child.props.url).toBe('http://custom');
  expect(child.props.appConfig).not.toBeDefined();
  expect(child.props.language).toBe('en');
  expect(child.props.workspaceId).toBe('42');
  expect(child.props.config).not.toBeDefined();
});

it('should render an uninstalled App block', () => {
  console.error = jest.fn();
  const root = renderer.create(<BlockLoader name="Bar.Block1" />);

  act(() => {
    return;
  });

  expect(console.error).toHaveBeenCalledWith(
    `"Bar.Block1" Block is not installed`
  );
});

it('should init block', () => {
  const { events } = usePage();
  const config = {
    onInit: 'initBlock',
  };
  const onLoad = jest.fn();
  const root = renderer.create(
    <BlockLoader name="Foo.Block1" config={config} onLoad={onLoad} />
  );

  act(() => {
    return;
  });

  const child = root.root.children[0] as renderer.ReactTestInstance;

  act(() => {
    child.props.onLoad();
  });

  expect(events!.emit).toHaveBeenCalledWith('initBlock', {
    config: { onInit: 'initBlock' },
    page: undefined,
  });
  expect(onLoad).toHaveBeenCalled();
});
