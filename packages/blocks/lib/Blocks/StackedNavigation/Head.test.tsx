import renderer from 'react-test-renderer';
import { HeadRenderer } from './Head';

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

it('should render with no block', () => {
  const blocks: Parameters<typeof HeadRenderer>[0]['blocks'] = [];
  const onBack = jest.fn();
  const root = renderer.create(
    <HeadRenderer blocks={blocks} onBack={onBack} hasHistory={false} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it('should render with blocks', () => {
  const blocks: Parameters<typeof HeadRenderer>[0]['blocks'] = [
    {
      block: 'Header',
    },
  ];
  const onBack = jest.fn();
  const root = renderer.create(
    <HeadRenderer blocks={blocks} onBack={onBack} hasHistory={true} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});
