import { Menu as AntdMenu } from 'antd';
import { useState } from 'react';
import { MenuInfo } from 'rc-menu/lib/interface';

interface MenuProps {
  items: string[];
  onSelect: (itemKey: string) => void;
}

const MenuTab = ({ items, onSelect }: MenuProps) => {
  const [selected, setSelected] = useState(items[0] || undefined);

  if (!items || selected === undefined) {
    return null;
  }

  const handleSelection = (item: MenuInfo) => {
    onSelect(item.key);
    setSelected(item.key);
  };

  return (
    <AntdMenu
      onClick={handleSelection}
      selectedKeys={[selected]}
      mode="horizontal"
      className="h-8"
    >
      {items.map((item) => (
        <AntdMenu.Item key={item}>{item}</AntdMenu.Item>
      ))}
    </AntdMenu>
  );
};

export default MenuTab;
