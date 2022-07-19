import { FieldProps, Schema, Tooltip } from '@prisme.ai/design-system';
import { ElementType } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useField } from 'react-final-form';
import { useTranslation } from 'next-i18next';
import Properties from '../../../SchemaFormBuilder/Properties';

const SchemaEditor = ({ name }: FieldProps & { Properties: ElementType }) => {
  const field = useField(name);
  const { t } = useTranslation('workspaces');

  return (
    <div className="flex flex-1 mt-4">
      <div className="ant-input ">
        <div className="text-gray pl-4 flex flex-1 flex-row justify-between">
          {t('pages.blocks.form.schema.label')}
          <div className="text-accent mr-2">
            <Tooltip
              title={t('pages.blocks.form.schema.description')}
              placement="left"
            >
              <InfoCircleOutlined />
            </Tooltip>
          </div>
        </div>
        <Properties
          value={field.input.value.properties}
          onChange={(v: Record<string, Schema>) =>
            field.input.onChange({
              type: 'object',
              properties: v,
            })
          }
          addLabel={t('pages.blocks.form.schema.add')}
        />
      </div>
    </div>
  );
};

const schema: Schema = {
  type: 'object',
  properties: {
    title: {
      type: 'localized:string',
      title: 'pages.blocks.settings.blockTitle.label',
      description: 'pages.blocks.settings.blockTitle.description',
    },
    schema: {
      type: 'object',
      'ui:widget': SchemaEditor,
    },
    submitLabel: {
      type: 'localized:string',
      title: 'pages.blocks.form.submitLabel.label',
    },
    hideSubmit: {
      type: 'boolean',
      title: 'pages.blocks.form.hideSubmit.label',
    },
    onSubmit: {
      type: 'string',
      title: 'pages.blocks.form.onSubmit.label',
      description: 'pages.blocks.form.onSubmit.description',
    },
    onChange: {
      type: 'string',
      title: 'pages.blocks.form.onChange.label',
      description: 'pages.blocks.form.onChange.description',
    },
  },
};

export default schema;
