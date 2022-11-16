import {
  AudioOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileUnknownOutlined,
  FileWordOutlined,
} from '@ant-design/icons';

export const getPreview = (mimetype: string, url: string) => {
  const [type] = mimetype.split(/\//);
  if (type === 'image') {
    return url;
  }

  if (mimetype === 'application/pdf') {
    return (
      <FilePdfOutlined className="text-4xl !text-accent flex items-center" />
    );
  }
  if (mimetype.includes('officedocument')) {
    return (
      <FileWordOutlined className="text-4xl !text-accent flex items-center" />
    );
  }
  if (type === 'audio') {
    return (
      <AudioOutlined className="text-4xl !text-accent flex items-center" />
    );
  }
  if (type === 'text') {
    return (
      <FileTextOutlined className="text-4xl !text-accent flex items-center" />
    );
  }

  return (
    <FileUnknownOutlined className="text-4xl !text-accent flex items-center" />
  );
};
