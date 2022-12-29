import { DoubleLeftOutlined } from '@ant-design/icons';
import renderer from 'react-test-renderer';
import Expand from './Expand';

it('should render', () => {
  const root = renderer.create(<Expand expanded onToggle={console.log} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should toggle', () => {
  const onToggle = jest.fn();
  const root = renderer.create(<Expand expanded={false} onToggle={onToggle} />);
  expect(root.toJSON()).toMatchSnapshot();
  root.root.findByType(DoubleLeftOutlined).props.onClick();
  expect(onToggle).toHaveBeenCalled();
});
