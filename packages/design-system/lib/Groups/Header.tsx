import { Button, Space, Avatar, Divider, Dropdown, Menu } from '../index';
import { FC, useMemo } from 'react';
import { ShareAltOutlined } from '@ant-design/icons';
import { ReactElement } from 'react';

interface HeaderProps {
  workspaces: string[];
  shareText: string;
  userName: string;
  userAvatar: string;
  icon?: ReactElement;
}

const Header = ({
  workspaces,
  shareText,
  userName,
  userAvatar,
  icon,
}: HeaderProps) => {
  const workspacesMenu = useMemo(
    () => <Menu items={workspaces} onClick={() => {}} />,
    [workspaces]
  );

  return (
    <div className="px-6 flex flex-row w-full justify-between items-center pr-header">
      {icon}
      <Dropdown Menu={workspacesMenu}>{workspaces[0]}</Dropdown>
      <div className="flex flex-row items-center">
        <Button variant="grey">
          <Space>
            {shareText}
            <ShareAltOutlined />
          </Space>
        </Button>
        <Divider type="vertical" className="mr-4" />
        <Space>
          {userName}
          <Avatar src={userAvatar} />
        </Space>
      </div>
    </div>
  );
};

export default Header;
