import {
  AudioOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FileUnknownOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
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
  if (
    mimetype.includes('officedocument.wordprocessingml') ||
    mimetype.includes('msword') ||
    mimetype.includes('ms-word')
  ) {
    return (
      <FileWordOutlined className="text-4xl !text-accent flex items-center" />
    );
  }

  if (
    mimetype.includes('officedocument.spreadsheetml') ||
    mimetype.includes('ms-excel')
  ) {
    return (
      <FileExcelOutlined className="text-4xl !text-accent flex items-center" />
    );
  }

  if (
    mimetype.includes('officedocument.presentationml') ||
    mimetype.includes('ms-powerpoint')
  ) {
    return (
      <FilePptOutlined className="text-4xl !text-accent flex items-center" />
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
