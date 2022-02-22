import Panel from './Panel';
import renderer, { act } from 'react-test-renderer';
import { Button } from '@prisme.ai/design-system';

it('should render', () => {
  const onVisibleChange = jest.fn();
  const div = {};
  const root = renderer.create(
    <Panel visible={true} onVisibleChange={onVisibleChange} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});
it('should hide', () => {
  jest.useFakeTimers();
  const onVisibleChange = jest.fn();
  const div = {};
  const root = renderer.create(
    <Panel visible={true} onVisibleChange={onVisibleChange} />
  );

  expect(root.toJSON()).toMatchSnapshot();

  act(() => {
    root.root.findByType(Button).props.onClick();
  });

  act(() => {
    jest.runAllTimers();
  });

  expect(onVisibleChange).toHaveBeenCalledWith(false);
});
