import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import Properties from './Properties';

export const ArgumentsEditor = ({ value, onChange }: any) => {
  const { t } = useTranslation('workspaces');

  return (
    <div className="ant-input">
      <div className="text-gray pl-4 flex flex-1 flex-row justify-between">
        {t('automations.arguments.title')}
        <div className="text-accent mr-2">
          <Tooltip
            title={t('automations.arguments.description')}
            placement="left"
          >
            <InfoCircleOutlined />
          </Tooltip>
        </div>
      </div>
      <Properties value={value} onChange={onChange} />
    </div>
  );
};

export default ArgumentsEditor;
