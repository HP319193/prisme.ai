import renderer from 'react-test-renderer';
import EmptyWorkspace from './Empty';
import { workspaceLayoutContext } from '../../layouts/WorkspaceLayout/context';

it('should render', () => {
  const root = renderer.create(
    <workspaceLayoutContext.Provider value={{} as any}>
      <EmptyWorkspace />
    </workspaceLayoutContext.Provider>
  );
  expect(root.toJSON()).toMatchSnapshot();
});
