import renderer, { act } from 'react-test-renderer';
import Content from './Content';

jest.mock('../../Provider/blocksContext', () => {
  const mock = {
    utils: {
      BlockLoader: jest.fn(function BlockLoader({ onLoad }: any) {
        onLoad && onLoad();
        return null;
      }),
    },
  };
  const useBlocks = () => mock;
  return {
    useBlocks,
  };
});

it('should render with only a title', () => {
  jest.useFakeTimers();
  const content: Parameters<typeof Content>[0]['content'] = {
    title: 'Foo',
    blocks: [],
  };
  const onUnmount = jest.fn();
  const root = renderer.create(
    <Content content={content} onUnmount={onUnmount} removed={false} />
  );
  expect(root.toJSON()).toMatchSnapshot();

  act(() => {
    jest.runAllTimers();
  });

  expect(root.toJSON()).toMatchSnapshot();
});

it('should be removed', () => {
  jest.useFakeTimers();
  const content: Parameters<typeof Content>[0]['content'] = {
    title: 'Foo',
    blocks: [],
  };
  const onUnmount = jest.fn();
  const root = renderer.create(
    <Content content={content} onUnmount={onUnmount} removed />
  );
  expect(root.toJSON()).toMatchSnapshot();

  act(() => {
    jest.runAllTimers();
  });

  expect(root.toJSON()).toMatchSnapshot();
});

it('should render with blocks', () => {
  const content: Parameters<typeof Content>[0]['content'] = {
    title: 'Foo',
    blocks: [
      {
        block: 'RichText',
        content: 'Hello World',
        onInit: 'initFoo',
      },
    ],
  };
  const onUnmount = jest.fn();

  const root = renderer.create(
    <Content content={content} onUnmount={onUnmount} removed={false} />
  );

  expect(root.toJSON()).toMatchSnapshot();
});
