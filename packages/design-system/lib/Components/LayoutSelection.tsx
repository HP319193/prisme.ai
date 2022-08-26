import { Col, Row, SearchInput, SidePanel } from '../index';
import { ReactNode, useMemo, useState } from 'react';
import ListItem, { ListItemProps } from './ListItem';
import Button from './Button';
import {
  LeftOutlined,
  PlusCircleOutlined,
  RightOutlined,
} from '@ant-design/icons';

const DEFAULT_ITEM_PER_PAGE = 10;

const paginate = (array: any[], page_size: number, page_number: number) => {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
};

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
  itemPerPage?: number;
  leftPanelWidth?: number;
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
  leftPanelWidth = 8,
  itemPerPage = DEFAULT_ITEM_PER_PAGE,
}: LayoutSelectionProps) => {
  const [searchValue, SetSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rightPanelWidth = 24 - leftPanelWidth;

  const filteredItems = useMemo(
    () =>
      paginate(
        items.filter(
          (item) =>
            item.title.toLowerCase().includes(searchValue.toLowerCase()) ||
            (typeof item.content === 'string' &&
              item.content.toLowerCase().includes(searchValue.toLowerCase()))
        ),
        itemPerPage,
        currentPage
      ),
    [searchValue, items, itemPerPage, currentPage]
  );

  const totalPages = Math.ceil(items.length / itemPerPage);

  return (
    <Row className="flex grow h-full">
      <Col span={leftPanelWidth} className="h-full">
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
              <div className={'flex flex-1 flex-col overflow-x-auto space-y-2'}>
                {filteredItems.map((item) => (
                  <ListItemWithSelection
                    {...item}
                    key={item.id}
                    selected={item.id === selected}
                    onSelect={onSelect}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex flex-row justify-between items-center">
                  <Button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <LeftOutlined />
                  </Button>
                  <div>
                    {currentPage} / {totalPages}
                  </div>
                  <Button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <RightOutlined />
                  </Button>
                </div>
              )}
            </div>
          }
        />
      </Col>
      <Col span={rightPanelWidth} className="h-full">
        {children}
      </Col>
    </Row>
  );
};

export default LayoutSelection;
