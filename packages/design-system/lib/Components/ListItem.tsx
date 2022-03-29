import { Space } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { Text } from '../';
import { MouseEventHandler, ReactElement } from 'react';

export interface ListItemProps {
  title: string | ReactElement;
  content?: string | ReactElement;
  rightContent?: string | ReactElement;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
}

const ListItem = ({
  title,
  content,
  rightContent,
  onClick,
  className,
}: ListItemProps) => (
  <div
    className={`flex grow border border-gray-200 rounded px-6 py-4 items-center justify-between cursor-pointer text-black ${className}`}
    onClick={onClick}
  >
    <Space direction="vertical" className="items-baseline overflow-hidden">
      <Text>{title}</Text>
      {content && <Text>{content}</Text>}
    </Space>
    <Space>{rightContent || <RightOutlined />}</Space>
  </div>
);

export default ListItem;
