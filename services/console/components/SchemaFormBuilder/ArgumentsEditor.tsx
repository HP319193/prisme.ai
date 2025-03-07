import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { FieldProps } from '@prisme.ai/design-system';
import { Button, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import { useField } from 'react-final-form';
import Properties from './Properties';

interface ArgumentsEditorProps extends FieldProps {
  title?: string;
  description?: string;
  add?: string;
}

export const ArgumentsEditor = ({
  name,
  title = 'automations.arguments.title',
  description = 'automations.arguments.description',
  add = 'automations.arguments.add',
}: ArgumentsEditorProps) => {
  const field = useField(name);
  const { t } = useTranslation('workspaces');

  return (
    <div className="flex flex-1 m-[1rem] flex-col">
      <div className="flex flex-1 justify-between items-baseline">
        <div>
          <label className="font-bold">{t(title)}</label>
          <Tooltip title={t(description)} placement="left">
            <button type="button" className="ml-2">
              <InfoCircleOutlined />
            </button>
          </Tooltip>
        </div>
        <Tooltip title={t(add)} placement="left">
          <Button
            className="-mr-2"
            onClick={() =>
              field.input.onChange({
                ...field.input.value,
                properties: {
                  ...field.input.value.properties,
                },
              })
            }
          >
            <PlusOutlined />
          </Button>
        </Tooltip>
      </div>
      <div className="!rounded-[0.3rem]">
        <Properties value={field.input.value} onChange={field.input.onChange} />
      </div>
    </div>
  );
};

export default ArgumentsEditor;
