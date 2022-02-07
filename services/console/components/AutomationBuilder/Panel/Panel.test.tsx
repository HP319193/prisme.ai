import Panel from './Panel';
import renderer, { act } from 'react-test-renderer';
import { Sidebar } from 'primereact/sidebar';

jest.mock('primereact/sidebar', () => {
  const Sidebar = () => <div>Sidebar</div>;
  return {
    Sidebar,
  };
});

it('should render', () => {
  const onVisibleChange = jest.fn();
  const div = {};
  const root = renderer.create(
    <Panel visible={true} onVisibleChange={onVisibleChange} />,
    {
      createNodeMock(el) {
        if (el.type === 'div') return div;
        return null;
      },
    }
  );
  expect(root.toJSON()).toMatchSnapshot();

  act(() => {
    root.update(<Panel visible={true} onVisibleChange={onVisibleChange} />);
  });

  expect(root.toJSON()).toMatchSnapshot();

  root.root.findByType(Sidebar).props.onHide();

  expect(onVisibleChange).toHaveBeenCalledWith(false);
});
