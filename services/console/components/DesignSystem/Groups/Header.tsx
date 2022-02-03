import { Button, Space, Avatar, Divider, Dropdown, Menu } from "../index";
import { useMemo } from "react";
import { ShareAltOutlined } from "@ant-design/icons";
import iconPrisme from "../../../icons/icon-prisme.svg";
import Image from "next/image";

interface HeaderProps {
  workspaces: string[];
  shareText: string;
  userName: string;
  userAvatar: string;
}

const Header = ({
  workspaces,
  shareText,
  userName,
  userAvatar,
}: HeaderProps) => {
  const workspacesMenu = useMemo(
    () => <Menu items={workspaces} onClick={() => {}} />,
    [workspaces]
  );

  return (
    <div className="px-6 flex flex-row w-full justify-between items-center pr-header">
      <Image src={iconPrisme} width={23} height={25} alt="prisme.ai logo" />
      <Dropdown Menu={workspacesMenu}>{workspaces[0]}</Dropdown>
      <div className="flex flex-row items-center">
        <Button type="grey">
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
