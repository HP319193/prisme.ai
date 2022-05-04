import { useBlock, Table } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

const previewData = Array.from(new Array(100000), (v, k) => ({
  Id: k,
  label: `Preview ${k}`,
}));

export const DataTable = ({ edit }: { edit: boolean }) => {
  const { t } = useTranslation('pages');
  const { config = {} } = useBlock();

  const preview = !!(!config.data && edit);

  const data: any[] = useMemo(() => {
    const rawData = config.data || (preview ? previewData : []);

    return Array.isArray(rawData)
      ? rawData.map((item: any, k: number) => ({
          key: k,
          ...item,
        }))
      : [];
  }, [config.data, preview]);

  const columns = useMemo(() => {
    const rawData = config.data || (preview ? previewData : []);
    return Array.isArray(rawData) && rawData[0]
      ? Object.keys(rawData[0]).map((key) => ({
          title: key,
          dataIndex: key,
          key,
          sorter: (a: any, b: any) => {
            const _a = a[key];
            const _b = b[key];
            if (_a < _b) return -1;
            if (_a > _b) return 1;
            return 0;
          },
        }))
      : [];
  }, [config.data, preview]);

  const locales = useMemo(
    () => ({
      emptyText: t('blocks.datatable.empty'),
      triggerAsc: t('blocks.datatable.asc'),
      triggerDesc: t('blocks.datatable.desc'),
      cancelSort: t('blocks.datatable.nosort'),
    }),
    [t]
  );

  return <Table dataSource={data} columns={columns} locale={locales} />;
};
DataTable.schema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      title: 'pages.blocks.datatable.settings.data.label',
      description: 'pages.blocks.datatable.settings.data.description',
      items: {
        type: 'object',
        additionalProperties: {
          type: 'string',
        },
        title: 'pages.blocks.datatable.settings.data.items.label',
        description: 'pages.blocks.datatable.settings.data.items.description',
      },
    },
  },
};
export default DataTable;
