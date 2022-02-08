import { Menu as AntdMenu } from 'antd';
import { useState } from 'react';
import { MenuInfo } from 'rc-menu/lib/interface';

interface MenuProps {
  items: (string | { label: string; key: string })[];
  selected?: string;
  onSelect: (itemKey: string) => void;
}

const MenuTab = ({ items, selected: initialSelected, onSelect }: MenuProps) => {
  const [selected, setSelected] = useState(
    initialSelected ||
      (items[0]
        ? typeof items[0] === 'string'
          ? items[0]
          : items[0].key
        : items[0]) ||
      undefined
  );

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
        <AntdMenu.Item key={typeof item === 'string' ? item : item.key}>
          {typeof item === 'string' ? item : item.label}
        </AntdMenu.Item>
      ))}
    </AntdMenu>
  );
};

export default MenuTab;
