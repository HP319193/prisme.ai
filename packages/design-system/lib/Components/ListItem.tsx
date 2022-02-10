import { Space } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { Text } from '../';

export interface ListItemProps {
  title: string;
  content?: string;
}

const ListItem = ({ title, content }: ListItemProps) => (
  <div
    className="flex grow border border-gray-200 rounded p-2 items-center justify-between cursor-pointer text-gray"
    key={title}
  >
    <Space direction="vertical" className="align-baseline">
      <Text type="grey">{title}</Text>
      {content && <Text type="grey">{content}</Text>}
    </Space>
    <Space>
      <RightOutlined />
    </Space>
  </div>
);

export default ListItem;
