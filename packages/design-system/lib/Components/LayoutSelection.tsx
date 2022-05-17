import { Col, Row, SearchInput, SidePanel } from '../index';
import { ReactNode, useMemo, useState } from 'react';
import ListItem, { ListItemProps } from './ListItem';
import Button from './Button';
import { PlusCircleOutlined } from '@ant-design/icons';

interface ListItemWithId extends ListItemProps {
  id: string;
  title: string;
}

export interface LayoutSelectionProps {
  children: ReactNode;
  items: ListItemWithId[];
  selected: string;
  onSelect: (s: string) => void;
  Header?: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  searchLabel?: string;
}

interface ListItemWithSelection extends ListItemWithId {
  selected: boolean;
  onSelect: (s: string) => void;
  id: string;
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
      onSelect(listItemProps.id);
    }}
    className={`!flex-initial ${className || ''} ${
      selected ? '!text-blue-500 !border-blue-500' : ''
    }`}
  />
);

const LayoutSelection = ({
  Header,
  children,
  items,
  selected,
  onSelect,
  onAdd,
  addLabel = 'add',
  searchLabel = '',
}: LayoutSelectionProps) => {
  const [searchValue, SetSearchValue] = useState('');

  const filteredItems = useMemo(
    () =>
      items.filter((item) =>
        item.title.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [searchValue, items]
  );

  return (
    <Row className="flex grow h-full">
      <Col span={8} className="h-full">
        <SidePanel
          children={
            <div className="flex w-full flex-col space-y-2 overflow-y-auto">
              {Header || null}
              <div className="flex items-center mb-3 flex-col">
                {onAdd && (
                  <Button onClick={onAdd} className="!flex items-center">
                    {addLabel}
                    <PlusCircleOutlined />
                  </Button>
                )}
                <SearchInput
                  value={searchValue}
                  onChange={(e) => SetSearchValue(e.target.value)}
                  className="grow"
                  placeholder={searchLabel}
                />
              </div>
              {filteredItems.map((item) => (
                <ListItemWithSelection
                  {...item}
                  key={item.id}
                  selected={item.id === selected}
                  onSelect={onSelect}
                />
              ))}
            </div>
          }
        />
      </Col>
      <Col span={16} className="h-full overflow-x-auto">
        {children}
      </Col>
    </Row>
  );
};

export default LayoutSelection;
