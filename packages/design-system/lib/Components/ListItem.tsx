import { Space } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { Text } from '../';

export interface ListItemProps {
  title: string;
  content?: string;
}

const ListItem = ({ title, content }: ListItemProps) => (
  <div
    className="flex grow border border-gray-200 rounded p-2 items-center justify-between cursor-pointer"
    key={title}
  >
    <Space direction="vertical">
      <div>{title}</div>
      {content && <Text type="grey">{content}</Text>}
    </Space>
    <Space>
      <RightOutlined className="text-gray" />
    </Space>
  </div>
);

export default ListItem;
