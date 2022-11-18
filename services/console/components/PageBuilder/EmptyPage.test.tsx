import renderer from 'react-test-renderer';
import EmptyPage from './EmptyPage';

it('should render', () => {
  const onAddBlock = jest.fn();
  const root = renderer.create(<EmptyPage onAddBlock={onAddBlock} />);
  expect(root.toJSON()).toMatchSnapshot();
  const els = root.root.findAllByType('button');

  els[0].props.onClick();
  expect(onAddBlock).toHaveBeenCalledWith();
  onAddBlock.mockClear();

  els[1].props.onClick();
  expect(onAddBlock).toHaveBeenCalledWith('Header');
  onAddBlock.mockClear();

  els[2].props.onClick();
  expect(onAddBlock).toHaveBeenCalledWith('Cards');
  onAddBlock.mockClear();

  els[3].props.onClick();
  expect(onAddBlock).toHaveBeenCalledWith('RichText');
  onAddBlock.mockClear();

  els[4].props.onClick();
  expect(onAddBlock).toHaveBeenCalledWith('Form');
  onAddBlock.mockClear();
});
