import { Button, Space, Avatar, Divider } from "./";

const Header = () => (
  <div className="px-2 flex flex-row w-full justify-between items-center pr-header border-b">
    <div>logo</div>
    <div>Nom de mon Workspace</div>
    <div className="flex flex-row items-center">
      <Button type="grey">
        <Space>
          Partager
          <i className="pi pi-share-alt" />
        </Space>
      </Button>
      <Divider type="vertical" className="mr-4" />
      <Space>
        John Doe
        <Avatar />
      </Space>
    </div>
  </div>
);

export default Header;
