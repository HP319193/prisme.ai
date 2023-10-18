import renderer from 'react-test-renderer';
import { appInstanceContext } from '../providers/AppInstanceProvider';
import { workspaceContext } from '../providers/Workspace';
import { AppInstance } from './AppInstance/AppInstance';
import workspaceContextValue from '../providers/Workspace/workspaceContextValue.mock';
import appInstanceContextValue from '../providers/AppInstanceProvider/appInstancesContextValue.mock';
import { workspaceLayoutContext } from '../layouts/WorkspaceLayout/context';

jest.mock('../utils/useYaml', () => {
  const toJSON = jest.fn();
  const toYaml = jest.fn();
  const useYaml = jest.fn(() => ({
    toJSON,
    toYaml,
  }));
  return useYaml;
});

jest.mock('next/router', () => {
  const mock = {
    query: {
      automationId: 'foo',
    },
    replace: jest.fn(),
  };
  return {
    useRouter: () => mock,
  };
});

it('should render', () => {
  const root = renderer.create(
    <workspaceContext.Provider value={workspaceContextValue}>
      <workspaceLayoutContext.Provider value={{} as any}>
        <appInstanceContext.Provider value={appInstanceContextValue}>
          <AppInstance />
        </appInstanceContext.Provider>
      </workspaceLayoutContext.Provider>
    </workspaceContext.Provider>
  );
  expect(root.toJSON()).toMatchSnapshot();
});
