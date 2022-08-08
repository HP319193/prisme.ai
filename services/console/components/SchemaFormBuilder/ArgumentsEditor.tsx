import { InfoCircleOutlined } from '@ant-design/icons';
import { FieldProps, Label } from '@prisme.ai/design-system';
import { Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { useField } from 'react-final-form';
import Properties from './Properties';

export const ArgumentsEditor = ({ name }: FieldProps) => {
  const field = useField(name);
  const { t } = useTranslation('workspaces');

  return (
    <div className="flex flex-1 mt-4 flex-col">
      <div className="flex flex-1 justify-between items-center">
        <Label
          label={t('automations.arguments.title')}
          className="font-semibold !mb-0"
        />
        <Tooltip
          title={t('automations.arguments.description')}
          placement="left"
        >
          <InfoCircleOutlined />
        </Tooltip>
      </div>
      <div className="!rounded-[0.3rem]">
        <Properties value={field.input.value} onChange={field.input.onChange} />
      </div>
    </div>
  );
};

export default ArgumentsEditor;
