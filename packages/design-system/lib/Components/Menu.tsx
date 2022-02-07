import { Menu as AntdMenu } from 'antd';

interface MenuProps {
  items: string[];
  onClick: Function;
  mode?: 'horizontal' | 'vertical';
}

const Menu = ({ items, onClick, mode = 'horizontal' }: MenuProps) => (
  <AntdMenu mode={mode}>
    {items.map((item) => (
      <AntdMenu.Item key={item} onClick={() => onClick(item)}>
        {item}
      </AntdMenu.Item>
    ))}
  </AntdMenu>
);

export default Menu;
