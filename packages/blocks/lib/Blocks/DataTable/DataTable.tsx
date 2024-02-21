import '../../i18n';
import { Table } from '@prisme.ai/design-system';
import { useBlock } from '../../Provider';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import BlockTitle from '../Internal/BlockTitle';

import EditableRow from './EditableRow';
import EditableCell from './EditableCell';
import { ColumnDefinition, OnEdit } from './types';
import renderValue from './RenderValue';
import useLocalizedText from '../../useLocalizedText';
import { TableProps } from 'antd';
import { BaseBlock } from '../BaseBlock';
import { BaseBlockConfig } from '../types';
import { Events } from '@prisme.ai/sdk';

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
  ...config
}: DataTableProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { localize } = useLocalizedText();

  const [dataSource, setDataSource] = useState<any>(initDataSource(data));

  useEffect(() => {
    setDataSource(initDataSource(data));
  }, [data]);

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
        sorter: key
          ? (a: any, b: any) => {
              const _a = key ? a[key] : '';
              const _b = key ? b[key] : '';
              if (_a < _b) return -1;
              if (_a > _b) return 1;
              return 0;
            }
          : undefined,
        onCell: (record: any) => ({
          record,
          dataIndex: key || '',
          editable: key && !!onEdit,
          title: key,
          handleSave: onEdit ? handleSave(onEdit) : null,
          type,
          validators,
          schemaForm,
        }),
        render: renderValue({
          key,
          type,
          language,
          format,
          onEdit,
          validators,
          schemaForm,
          actions:
            actions && Array.isArray(actions)
              ? actions.map((action) => ({
                  ...action,
                  label: localize(action.label),
                }))
              : undefined,
        }),
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

  return (
    <div
      className={`pr-block-data-table ${className}                  block-data-table`}
    >
      {config.title && <BlockTitle value={localize(config.title)} />}
      <div className="pr-block-data-table__table-container                 block-data-table__table-container table-container">
        <Table
          dataSource={dataSource}
          columns={columns}
          locale={locales}
          components={components}
          pagination={pagination}
          {...config.customProps}
        />
      </div>
    </div>
  );
};

const defaultStyles = `
.pr-block-data-table__table-container {
  overflow: auto;
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
