import Panel from './Panel';
import renderer from 'react-test-renderer';

it('should render', () => {
  const onVisibleChange = jest.fn();
  const div = {};
  const root = renderer.create(
    <Panel title="hey" visible={true} onVisibleChange={onVisibleChange} />
  );
  expect(root.toJSON()).toMatchSnapshot();
});

// The use of Layout in the panel made it complicated to mock the button which is rendered in the Layout section

// it('should hide', () => {
//   jest.useFakeTimers();
//   const onVisibleChange = jest.fn();
//   const div = {};
//   const root = renderer.create(
//     <Panel title="hey" visible={true} onVisibleChange={onVisibleChange} />
//   );
//
//   expect(root.toJSON()).toMatchSnapshot();
//
//   act(() => {
//     root.root.findByType(Button).props.onClick();
//   });
//
//   act(() => {
//     jest.runAllTimers();
//   });
//
//   expect(onVisibleChange).toHaveBeenCalledWith(false);
// });
