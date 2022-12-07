import renderer from 'react-test-renderer';
import { appInstanceContext } from '../providers/AppInstanceProvider';
import { workspaceContext } from '../providers/Workspace';
import { AppInstance } from './AppInstance';
import workspaceContextValue from '../providers/Workspace/workspaceContextValue.mock';
import appInstanceContextValue from '../providers/AppInstanceProvider/appInstancesContextValue.mock';

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
      <appInstanceContext.Provider value={appInstanceContextValue}>
        <AppInstance />
      </appInstanceContext.Provider>
    </workspaceContext.Provider>
  );
  expect(root.toJSON()).toMatchSnapshot();
});
