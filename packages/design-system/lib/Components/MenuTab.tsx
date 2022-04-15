import { Menu as AntdMenu } from 'antd';
import { ReactElement, useState } from 'react';
import { MenuInfo } from 'rc-menu/lib/interface';

interface MenuProps {
  items: (string | { label: string | ReactElement; key: string })[];
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
      selectedKeys={selected ? [selected] : undefined}
      mode="horizontal"
      className="w-full"
    >
      {items.map((item) => (
        <AntdMenu.Item
          key={typeof item === 'string' ? item : item.key}
          className={
            selected === (typeof item === 'string' ? item : item.key)
              ? 'font-medium'
              : 'font-light'
          }
        >
          {typeof item === 'string' ? item : item.label}
        </AntdMenu.Item>
      ))}
    </AntdMenu>
  );
};

export default MenuTab;
