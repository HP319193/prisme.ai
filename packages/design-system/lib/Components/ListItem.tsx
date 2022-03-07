import { Space } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { Text } from '../';
import { ReactElement } from 'react';

export interface ListItemProps {
  title: string | ReactElement;
  content?: string;
  rightContent?: string | ReactElement;
}

const ListItem = ({ title, content, rightContent }: ListItemProps) => (
  <div className="flex grow border border-gray-200 rounded px-6 py-4 items-center justify-between cursor-pointer text-black">
    <Space direction="vertical" className="align-baseline">
      <Text>{title}</Text>
      {content && <Text>{content}</Text>}
    </Space>
    <Space>
      {rightContent}
      <RightOutlined />
    </Space>
  </div>
);

export default ListItem;
