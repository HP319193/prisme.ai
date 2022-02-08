import { Button, Space, Avatar, Divider, Dropdown, Menu } from '../index';
import { FC, useMemo } from 'react';
import { ShareAltOutlined } from '@ant-design/icons';
import { ReactElement } from 'react';

export interface HeaderProps {
  workspaces: string[];
  t: Function;
  userName: string;
  userAvatar: string;
  icon?: ReactElement;
}

const Header = ({ workspaces, t, userName, userAvatar, icon }: HeaderProps) => {
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
            {t('shareText')}
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
