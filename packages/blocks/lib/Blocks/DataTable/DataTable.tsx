import '../../i18n';
import { Table } from '@prisme.ai/design-system';
import tw from '../../tw';
import { useBlock } from '../../Provider';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import BlockTitle from '../Internal/BlockTitle';
import { withI18nProvider } from '../../i18n';

import EditableRow from './EditableRow';
import EditableCell from './EditableCell';
import { ColumnDefinition } from './types';
import renderValue from './RenderValue';
import useLocalizedText from '../../useLocalizedText';
import { TableProps } from 'antd';

const previewData = Array.from(new Array(100000), (v, k) => ({
  Id: k,
  label: `Preview ${k}`,
}));

export interface DataTableConfig {
  title?: Prismeai.LocalizedText;
  data: Record<string, any>[];
  columns?: ColumnDefinition[];
  pagination?: {
    event: string;
    page: number;
    pages: number;
  };
}

const components = {
  body: {
    row: EditableRow,
    cell: EditableCell,
  },
};

const emptyArray: DataTableConfig['data'] = [];

export const DataTable = ({ edit }: { edit?: boolean }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const { localize } = useLocalizedText();
  const { config = { data: emptyArray }, events } = useBlock<DataTableConfig>();

  const preview = !!(!config.data && edit);

  const [dataSource, setDataSource] = useState<any>();

  useEffect(() => {
    const rawData = config.data || (preview ? previewData : []);

    setDataSource(
      Array.isArray(rawData)
        ? rawData.map((item: any, k: number) => ({
            key: k,
            ...item,
          }))
        : []
    );
  }, [config.data, preview]);

  const columns = useMemo(() => {
    const rawData = dataSource;

    if (!Array.isArray(rawData) || !rawData[0]) return [];

    const columnsSpecification =
      config.columns ||
      Object.keys(rawData[0]).map((key) => ({
        key,
        label: key,
        type: 'string',
        actions: undefined,
        onEdit: undefined,
        format: undefined,
      }));

    const handleSave = (onEdit: string) => (row: Record<string, any>) => {
      const { key, ...data } = row;
      events?.emit(onEdit, { data, key });

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
      ({ key, label = key, type = 'string', actions, onEdit, format }) => ({
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
        }),
        render: renderValue({
          key,
          type,
          language,
          format,
          onEdit,
          actions: actions?.map((action) => ({
            ...action,
            label: localize(action.label),
          })),
          events,
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
    const { event, page, pages } = config.pagination;
    return {
      total: pages,
      current: page,
      onChange: (page) => {
        events?.emit(event, {
          page,
        });
      },
    } as TableProps<any>['pagination'];
  }, []);

  return (
    <div className={tw`block-data-table p-8`}>
      {config.title && <BlockTitle value={localize(config.title)} />}
      <div
        className={tw`block-data-table__table-container table-container overflow-auto`}
      >
        <Table
          dataSource={dataSource}
          columns={columns}
          locale={locales}
          components={components}
          pagination={pagination}
        />
      </div>
    </div>
  );
};
export default withI18nProvider(DataTable);
