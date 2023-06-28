import { BlocksProvider } from './BlocksProvider';
import renderer from 'react-test-renderer';
import api from '../../utils/api';

jest.mock('@prisme.ai/blocks', () => ({
  BlocksProvider: function BlocksProvider() {
    return null;
  },
}));

jest.mock('../../../console/utils/api', () => ({
  uploadFiles: jest.fn((file: string) => [
    {
      url: 'http://thefile',
      name: file,
      mimetype: 'image/jpg',
    },
  ]),
}));

jest.mock('../Workspace', () => ({
  useWorkspace: () => ({ id: '42' }),
}));

it('should upload a file', async () => {
  const root = renderer.create(<BlocksProvider />);
  const {
    props: {
      utils: { uploadFile },
    },
  } = root.root.children[0] as renderer.ReactTestInstance;
  const value = await uploadFile('file.jpg');
  expect(api.uploadFiles).toHaveBeenCalledWith('file.jpg', '42');
  expect(value).toEqual({
    value: 'http://thefile',
    preview: 'http://thefile',
    label: 'file.jpg',
  });
});
