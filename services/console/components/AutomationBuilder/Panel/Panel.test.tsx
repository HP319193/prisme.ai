import Panel from './Panel';
import renderer, { act } from 'react-test-renderer';
import { Button } from '@prisme.ai/design-system';

jest.mock('@prisme.ai/design-system', () => {
  return {
    ListItem({ children = null }: any) {
      return children;
    },
    SearchInput({ children = null }: any) {
      return children;
    },
    Space({ children = null }: any) {
      return children;
    },
    Title({ children = null }: any) {
      return children;
    },
    Button({ children = null }: any) {
      return children;
    },
    SidePanel({ children = null }: any) {
      return children;
    },
  };
});

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
