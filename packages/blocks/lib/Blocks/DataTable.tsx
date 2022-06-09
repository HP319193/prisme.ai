import '../i18n';
import { Table } from '@prisme.ai/design-system';
import { tw } from 'twind';
import { useBlock } from '../Provider';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import BlockTitle from './Internal/BlockTitle';
import { withI18nProvider } from '../i18n';

const previewData = Array.from(new Array(100000), (v, k) => ({
  Id: k,
  label: `Preview ${k}`,
}));

export const DataTable = ({ edit }: { edit: boolean }) => {
  const { t } = useTranslation();
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
      emptyText: t('datatable.empty'),
      triggerAsc: t('datatable.asc'),
      triggerDesc: t('datatable.desc'),
      cancelSort: t('datatable.nosort'),
    }),
    [t]
  );

  return (
    <div className={tw`p-8`}>
      {config.title && <BlockTitle value={config.title} />}
      <div className={tw`overflow-scroll`}>
        <Table dataSource={data} columns={columns} locale={locales} />
      </div>
    </div>
  );
};
export default withI18nProvider(DataTable);
