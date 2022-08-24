import '../../i18n';
import { Button, Switch, Table } from '@prisme.ai/design-system';
import { Tag } from 'antd';
import tw from '../../tw';
import { useBlock } from '../../Provider';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import BlockTitle from '../Internal/BlockTitle';
import { withI18nProvider } from '../../i18n';
import Color from 'color';
import EditableRow from './EditableRow';
import EditableCell from './EditableCell';
import { ColumnDefinition } from './types';

const previewData = Array.from(new Array(100000), (v, k) => ({
  Id: k,
  label: `Preview ${k}`,
}));

const generateColor = (str: string) => {
  const cyrb53 = function (str = '', seed = 0) {
    let h1 = 0xdeadbeef ^ seed,
      h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 =
      Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
      Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 =
      Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
      Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  };
  const h = cyrb53(str).toString(16).substring(0, 6);

  return `#${h}`;
};

export interface DataTableConfig {
  title?: string;
  data: Record<string, any>[];
  columns?: ColumnDefinition[];
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
        actions: [],
        onEdit: null,
        format: null,
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
        title: label,
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
        render: (_: any, item: any) => {
          const value = key ? item[key] : undefined;
          switch (type) {
            case 'number': {
              const formatter = new Intl.NumberFormat(
                language,
                format as Intl.NumberFormatOptions
              );
              return formatter.format(+value);
            }
            case 'date': {
              const formatter = new Intl.DateTimeFormat(
                language,
                format as Intl.DateTimeFormatOptions
              );
              return formatter.format(new Date(value));
            }
            case 'boolean':
              return <Switch defaultChecked={!!value} disabled={!onEdit} />;
            case 'tags':
              const tags = Array.isArray(value) ? value : [value];

              return (
                <>
                  {tags.map((tag) => (
                    <Tag
                      color={generateColor(tag)}
                      key={tag}
                      style={{
                        color: Color(generateColor(tag)).isLight()
                          ? 'inherit'
                          : 'white',
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </>
              );
            case 'string':
            default:
              if (actions) {
                return Array.isArray(actions) ? (
                  <>
                    {actions.map(({ label, event, payload, url }) => (
                      <Button
                        key={`${label}${event}${url}`}
                        type="button"
                        onClick={() => {
                          const { key, ...data } = item;
                          if (event) {
                            events?.emit(event, { ...payload, data, key });
                          }
                          if (url) {
                            const computedUrl = url.replace(
                              /\{\{([^}]+)\}\}/g,
                              (_, m) => item[m] || ''
                            );
                            window.open(computedUrl);
                          }
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </>
                ) : null;
              }
              if (typeof value === 'object') {
                return JSON.stringify(value);
              }
              return value;
          }
        },
      })
    );
  }, [dataSource]);

  const locales = useMemo(
    () => ({
      emptyText: t('datatable.empty'),
      triggerAsc: t('datatable.asc'),
      triggerDesc: t('datatable.desc'),
      cancelSort: t('datatable.nosort'),
    }),
    [t, language]
  );

  return (
    <div className={tw`block-data-table p-8`}>
      {config.title && <BlockTitle value={config.title} />}
      <div
        className={tw`block-data-table__table-container table-container overflow-scroll`}
      >
        <Table
          dataSource={dataSource}
          columns={columns}
          locale={locales}
          components={components}
        />
      </div>
    </div>
  );
};
export default withI18nProvider(DataTable);
