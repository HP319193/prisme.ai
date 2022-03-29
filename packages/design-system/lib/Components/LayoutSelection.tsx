import { Col, Row, SidePanel } from '../index';
import { ReactNode } from 'react';
import ListItem, { ListItemProps } from './ListItem';

interface ListItemWithId extends ListItemProps {
  id: string;
}

export interface LayoutSelectionProps {
  children: ReactNode;
  items: ListItemWithId[];
  selected: string;
  onSelect: (s: string) => void;
  Header?: ReactNode;
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
    className={`${className || ''} ${selected ? 'text-blue' : ''}`}
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
    <Row className="flex grow">
      <Col span={8}>
        <SidePanel
          children={
            <div className="flex grow flex-col space-y-2">
              {Header || null}
              {items.map((item) => (
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
      <Col span={16}>{children}</Col>
    </Row>
  );
};

export default LayoutSelection;
