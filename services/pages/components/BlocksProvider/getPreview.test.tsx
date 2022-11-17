import { getPreview } from './getPreview';
import renderer from 'react-test-renderer';
import {
  FilePdfOutlined,
  FileWordOutlined,
  AudioOutlined,
  FileTextOutlined,
  FileUnknownOutlined,
} from '@ant-design/icons';
jest.mock('@ant-design/icons', () => ({
  FilePdfOutlined: function FilePdfOutlined() {
    return null;
  },
  FileWordOutlined: function FileWordOutlined() {
    return null;
  },
  AudioOutlined: function AudioOutlined() {
    return null;
  },
  FileTextOutlined: function FileTextOutlined() {
    return null;
  },
  FileUnknownOutlined: function FileUnknownOutlined() {
    return null;
  },
}));
it('should get image preview', () => {
  expect(getPreview('image/jpg', 'file.jpg')).toEqual('file.jpg');
});

it('should get pdf preview', () => {
  const preview = getPreview('application/pdf', 'file.pdf') as JSX.Element;
  expect(preview.type).toEqual(FilePdfOutlined);
  const root = renderer.create(preview);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should get office preview', () => {
  const preview = getPreview(
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'file.doc'
  ) as JSX.Element;
  expect(preview.type).toEqual(FileWordOutlined);
  const root = renderer.create(preview);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should get audio preview', () => {
  const preview = getPreview('audio/mp3', 'file.mp3') as JSX.Element;
  expect(preview.type).toEqual(AudioOutlined);
  const root = renderer.create(preview);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should get text preview', () => {
  const preview = getPreview('text/plain', 'file.text') as JSX.Element;
  expect(preview.type).toEqual(FileTextOutlined);
  const root = renderer.create(preview);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should get anything else preview', () => {
  const preview = getPreview(
    'application/octet-stream',
    'file.bin'
  ) as JSX.Element;
  expect(preview.type).toEqual(FileUnknownOutlined);
  const root = renderer.create(preview);
  expect(root.toJSON()).toMatchSnapshot();
});
