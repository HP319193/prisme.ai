import { Menu as AntdMenu } from "antd";

interface MenuProps {
  items: string[];
}

const Menu = ({ items }: MenuProps) => (
  <AntdMenu>
    {items.map((item) => (
      <AntdMenu.Item key={item}>item</AntdMenu.Item>
    ))}
  </AntdMenu>
);

export default Menu;
