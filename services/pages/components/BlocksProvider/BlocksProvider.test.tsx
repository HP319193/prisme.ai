import { BlocksProvider } from './BlocksProvider';
import renderer from 'react-test-renderer';
import api from '../../../console/utils/api';
import userContext from '../../../console/components/UserProvider/context';
import { workspaceContext } from '../../../console/providers/Workspace/WorkspaceProvider';
import workspaceContextMock from '../../../console/providers/Workspace/workspaceContextValue.mock';

jest.mock('@prisme.ai/blocks', () => ({
  BlocksProvider: function BlocksProvider() {
    return null;
  },
}));

jest.mock('../../../console/utils/api', () => {
  const workspaceService = {
    uploadFiles: jest.fn((file: string) => [
      {
        url: 'http://thefile',
        name: file,
        mimetype: 'image/jpg',
      },
    ]),
  };
  return {
    workspaces: () => workspaceService,
  };
});

jest.mock('../Workspace', () => ({
  useWorkspace: () => ({ id: '42' }),
}));

it('should upload a file', async () => {
  const root = renderer.create(
    <userContext.Provider value={{} as any}>
      <workspaceContext.Provider value={workspaceContextMock}>
        <BlocksProvider />
      </workspaceContext.Provider>
    </userContext.Provider>
  );
  const {
    props: {
      utils: { uploadFile },
    },
  } = root.root.children[0] as renderer.ReactTestInstance;
  const value = await uploadFile('file.jpg');
  expect(api.workspaces('42').uploadFiles).toHaveBeenCalledWith(
    'file.jpg',
    undefined
  );
  expect(value).toEqual({
    value: 'http://thefile',
    preview: 'http://thefile',
    label: 'file.jpg',
  });
});
