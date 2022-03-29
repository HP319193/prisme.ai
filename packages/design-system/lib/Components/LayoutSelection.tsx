import { SidePanel } from '../index';
import { ReactNode } from 'react';
import { SidePanelProps } from './SidePanel';
import ListItem, { ListItemProps } from './ListItem';

interface ListItemWithKey extends ListItemProps {
  key: string;
}

export interface LayoutSelectionProps {
  children: ReactNode;
  Header: SidePanelProps['Header'];
  items: ListItemWithKey[];
  selected: string;
  onSelect: (s: string) => void;
}

interface ListItemWithSelection extends ListItemWithKey {
  selected: boolean;
  onSelect: (s: string) => void;
  key: string;
}

const ListItemWithSelection = ({
  selected,
  onSelect,
  className,
  ...listItemProps
}: ListItemWithSelection) => (
  <ListItem
    {...listItemProps}
    onClick={(e) => {
      listItemProps.onClick && listItemProps.onClick(e);
      onSelect(listItemProps.key);
    }}
    className={`${className || ''} ${selected ? 'text-blue-500' : ''}`}
  />
);

const LayoutSelection = ({
  Header,
  children,
  items,
  selected,
  onSelect,
}: LayoutSelectionProps) => {
  return (
    <div className="flex grow">
      <SidePanel
        children={
          <div className="flex grow flex-col space-y-2">
            {Header}
            {items.map((item) => (
              <ListItemWithSelection
                {...item}
                selected={item.key === selected}
                onSelect={onSelect}
              />
            ))}
          </div>
        }
      />
      {children}
    </div>
  );
};

export default LayoutSelection;
