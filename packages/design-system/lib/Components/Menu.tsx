import { Menu as AntdMenu } from 'antd';
import { ReactElement } from 'react';

export type MenuItem = { label: string | ReactElement; key: string };
interface MenuProps {
  items: (string | MenuItem)[];
  onClick: (v: string | MenuItem) => void;
  mode?: 'horizontal' | 'vertical';
}

const Menu = ({ items, onClick, mode = 'horizontal' }: MenuProps) => (
  <AntdMenu mode={mode}>
    {items.map((item) => (
      <AntdMenu.Item
        key={typeof item === 'string' ? item : item.key}
        onClick={() => onClick(item)}
      >
        {typeof item === 'string' ? item : item.label}
      </AntdMenu.Item>
    ))}
  </AntdMenu>
);

export default Menu;
