import { InfoCircleOutlined } from '@ant-design/icons';
import { FieldProps } from '@prisme.ai/design-system';
import { Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { useField } from 'react-final-form';
import Properties from './Properties';

export const ArgumentsEditor = ({ name }: FieldProps) => {
  const field = useField(name);
  const { t } = useTranslation('workspaces');

  return (
    <div className="flex flex-1 mt-4">
      <div className="ant-input ">
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
        <Properties value={field.input.value} onChange={field.input.onChange} />
      </div>
    </div>
  );
};

export default ArgumentsEditor;
