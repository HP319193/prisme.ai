import { useTranslation } from 'next-i18next';
import Properties from './Properties';

export const ArgumentsEditor = ({ value, onChange }: any) => {
  const { t } = useTranslation('workspaces');

  return (
    <div className="ant-input">
      <div className="text-gray pl-4">{t('automations.arguments.title')}</div>
      <Properties value={value} onChange={onChange} />
    </div>
  );
};

export default ArgumentsEditor;
