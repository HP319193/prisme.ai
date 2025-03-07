import '../../i18n';
import { Table } from '@prisme.ai/design-system';
import { useBlock } from '../../Provider';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useRef, useState } from 'react';
import BlockTitle from '../Internal/BlockTitle';

import EditableRow from './EditableRow';
import EditableCell from './EditableCell';
import { ColumnDefinition, DataType, MenuItem, OnEdit } from './types';
import RenderValue from './RenderValue';
import useLocalizedText from '../../useLocalizedText';
import { TableProps } from 'antd';
import { BaseBlock } from '../BaseBlock';
import { BaseBlockConfig } from '../types';
import { Events } from '@prisme.ai/sdk';
import { toKebab } from '../../utils/toKebab';
import {
  ContextMenu,
  ContextMenuDropDown,
  useContextMenu,
} from './ContextMenu';

export interface DataTableConfig extends BaseBlockConfig {
  title?: Prismeai.LocalizedText;
  data: Record<string, any>[];
  columns?: ColumnDefinition[];
  pagination?: {
    event: string;
    page: number;
    itemCount: number;
    pageSize?: number;
    payload?: Record<string, any>;
  };
  customProps?: any;
  onSort?:
    | string
    | {
        event: string;
        payload?: Record<string, any>;
      };
  initialSort?: {
    by: string;
    order: 'ascend' | 'descend';
  };
  bulkActions?: {
    onSelect?:
      | string
      | {
          event: string;
          payload?: Record<string, any>;
        };
    label: Prismeai.LocalizedText;
  }[];
  headerContextMenu?: MenuItem[];
  contextMenu?: MenuItem[];
  sticky?: boolean;
}

interface DataTableProps extends DataTableConfig {
  events?: Events;
}

const components = {
  body: {
    row: EditableRow,
    cell: EditableCell,
  },
};

const emptyArray: DataTableConfig['data'] = [];

function initDataSource(data: DataTableConfig['data']) {
  return Array.isArray(data)
    ? data.map((item: any, k: number) => ({
        key: `${k}`,
        ...item,
      }))
    : [];
}

export const DataTable = ({
  className = '',
  data = emptyArray,
  events,
  onSort,
  bulkActions,
  contextMenu,
  headerContextMenu,
  initialSort,
  sticky,
  ...config
}: DataTableProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { localize } = useLocalizedText();

  const [dataSource, setDataSource] = useState<any>(initDataSource(data));

  // When table is sticky, to force re-calculate the table height, it needs to
  // unmount the component
  const [mountedTable, setMountedTable] = useState(true);
  useEffect(() => {
    if (sticky) {
      setMountedTable(false);
      setTimeout(() => setMountedTable(true));
    }
    setDataSource(initDataSource(data));
  }, [data, sticky]);

  const { contextMenuSpec, setContextMenu } = useContextMenu();

  const columns = useMemo(() => {
    const rawData = data;

    if (!Array.isArray(rawData) || !rawData[0]) return [];

    const columnsSpecification =
      config.columns ||
      Object.keys(rawData[0]).map<ColumnDefinition>((key) => ({
        key,
        label: key,
        type: 'string',
        actions: undefined,
        onEdit: undefined,
        format: undefined,
      }));

    const handleSave =
      (onEdit: NonNullable<ColumnDefinition['onEdit']>) =>
      (row: Record<string, any>) => {
        const { key, ...data } = row;
        const { event, payload = {} } =
          typeof onEdit === 'string' ? ({ event: onEdit } as OnEdit) : onEdit;
        events?.emit(event, { ...payload, data, key });

        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setDataSource(newData);
      };

    return columnsSpecification.map(
      ({
        key,
        label = key,
        type = 'string',
        actions,
        onEdit,
        format,
        validators,
        schemaForm,
      }) => ({
        title: localize(label),
        dataIndex: key,
        key,
        defaultSortOrder:
          key === initialSort?.by ? initialSort?.order : undefined,
        sorter: onSort
          ? true
          : key
          ? (a: any, b: any) => {
              const _a = key ? a[key] : '';
              const _b = key ? b[key] : '';
              if (_a < _b) return -1;
              if (_a > _b) return 1;
              return 0;
            }
          : undefined,
        onHeaderCell: (col: any) => ({
          col,
          onContextMenu: (e: MouseEvent) => {
            if (!headerContextMenu) return;
            e.preventDefault();
            setContextMenu({
              content: (
                <ContextMenu
                  items={headerContextMenu}
                  onSelect={() =>
                    setContextMenu((prev) => ({
                      ...prev,
                      visible: false,
                    }))
                  }
                  payload={{
                    column: col.key,
                  }}
                />
              ),
              visible: true,
              position: {
                x: e.clientX,
                y: e.clientY,
              },
            });
          },
        }),
        onCell: (record: any) => ({
          record,
          dataIndex: key || '',
          editable: key && !!onEdit,
          title: key,
          handleSave: onEdit ? handleSave(onEdit) : null,
          type,
          validators,
          schemaForm,
          className: key && `pr-block-data-table__cell--${toKebab(key)}`,
          onContextMenu: (e: MouseEvent) => {
            if (!contextMenu) return;
            e.preventDefault();
            setContextMenu({
              content: (
                <ContextMenu
                  items={contextMenu}
                  onSelect={() => {
                    setContextMenu((prev) => ({
                      ...prev,
                      visible: false,
                    }));
                  }}
                  payload={{ record: { ...record, key } }}
                />
              ),
              visible: true,
              position: {
                x: e.clientX,
                y: e.clientY,
              },
            });
          },
        }),
        render: (_: any, item: any) => (
          <RenderValue
            colKey={key}
            type={type}
            language={language}
            format={format}
            onEdit={onEdit}
            validators={validators}
            actions={actions}
            item={item}
          />
        ),
      })
    );
  }, [dataSource, localize]);

  const locales = useMemo(
    () => ({
      emptyText: t('datatable.empty'),
      triggerAsc: t('datatable.asc'),
      triggerDesc: t('datatable.desc'),
      cancelSort: t('datatable.nosort'),
    }),
    [t, language]
  );

  const pagination = useMemo(() => {
    if (!config.pagination || !config.pagination.event) return undefined;
    const {
      event,
      page,
      itemCount,
      pageSize = 10,
      payload = {},
    } = config.pagination;

    return {
      total: itemCount,
      current: page,
      pageSize: pageSize,
      showSizeChanger: false,
      onChange: (page) => {
        events?.emit(event, {
          page,
          ...payload,
        });
      },
    } as TableProps<any>['pagination'];
  }, [config.pagination]);

  const prevTableSort = useRef('');
  const handleTableChange: TableProps<any>['onChange'] = (
    pagination,
    filters,
    sorter
  ) => {
    if (!onSort) return;
    if (!prevTableSort.current && Object.keys(sorter).length === 0) return;
    if (JSON.stringify(sorter) === prevTableSort.current) return;
    prevTableSort.current = JSON.stringify(sorter);
    const { event, payload } =
      typeof onSort === 'string' ? { event: onSort, payload: {} } : onSort;
    events?.emit(event, {
      ...payload,
      ...sorter,
    });
  };

  const [selection, setSelection] = useState({
    selectedRowKeys: [] as React.Key[],
    selectedRows: [] as DataType[],
  });
  const rowSelection = useMemo(
    () =>
      bulkActions && {
        selectedRowKeys: selection.selectedRowKeys,
        onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
          setSelection({
            selectedRowKeys,
            selectedRows,
          });
        },
        selections: bulkActions.flatMap(({ label, onSelect }) =>
          onSelect
            ? [
                {
                  key: label,
                  text: localize(label),
                  onSelect: () => {
                    const { event, payload = {} } =
                      typeof onSelect === 'string'
                        ? { event: onSelect }
                        : onSelect;
                    events?.emit(event, {
                      ...payload,
                      data: selection?.selectedRows,
                    });
                    setSelection({
                      selectedRowKeys: [],
                      selectedRows: [],
                    });
                  },
                },
              ]
            : []
        ),
      },
    [events, bulkActions, localize, selection]
  );

  const containerRef = useRef<any>(null);
  const [offsetHeight, setOffsetHeight] = useState(0);
  useEffect(() => {
    const offsetHeight =
      (containerRef?.current?.offsetHeight || 0) -
      (containerRef?.current?.querySelector('.ant-pagination')?.offsetHeight ||
        0) -
      (containerRef?.current?.querySelector('.ant-table-thead')?.offsetHeight ||
        0);
    if (offsetHeight) {
      setOffsetHeight(offsetHeight);
    }
  });

  return (
    <div
      className={`pr-block-data-table ${className} ${
        selection?.selectedRowKeys.length > 0
          ? 'pr-block-data-table--has-bulk-selection'
          : ''
      }                  block-data-table`}
      ref={containerRef}
    >
      {config.title && <BlockTitle value={localize(config.title)} />}
      <div className="pr-block-data-table__table-container                 block-data-table__table-container table-container">
        {mountedTable && (
          <Table
            rowSelection={
              bulkActions && {
                type: 'checkbox',
                ...rowSelection,
              }
            }
            dataSource={dataSource}
            columns={columns}
            locale={locales}
            components={components}
            pagination={pagination}
            onChange={handleTableChange}
            scroll={
              sticky && offsetHeight
                ? { x: columns.length * 250, y: offsetHeight }
                : undefined
            }
            {...config.customProps}
          />
        )}
        <ContextMenuDropDown
          {...contextMenuSpec}
          onClose={() =>
            setContextMenu((prev) => ({ ...prev, visible: false }))
          }
        />
      </div>
    </div>
  );
};

const defaultStyles = `
.pr-block-data-table__table-container {
  overflow: auto;
}
.ant-table-selection {
  display: flex;
  flex-direction: row;
  width: 3rem;
}
.ant-table-selection-column {
  text-align: left;
}
.ant-table-selection-extra {
  left: 1.5rem;
  opacity: 0;
  transition: opacity .2s ease-in;
}
:block.pr-block-data-table--has-bulk-selection .ant-table-selection-extra {
  opacity: 1;
}
.ant-table-selection-extra svg {
  color: black;
}
`;

export const DataTableInContext = () => {
  const { config, events } = useBlock<DataTableConfig>();

  return (
    <BaseBlock defaultStyles={defaultStyles}>
      <DataTable {...config} events={events} />
    </BaseBlock>
  );
};
DataTableInContext.styles = defaultStyles;

export default DataTableInContext;
