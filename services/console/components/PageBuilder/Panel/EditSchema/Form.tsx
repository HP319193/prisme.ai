import { FieldProps, Schema, Tooltip } from '@prisme.ai/design-system';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useField } from 'react-final-form';
import { useTranslation } from 'next-i18next';
import Properties from '../../../SchemaFormBuilder/Properties';
import { Button } from 'antd';

const SchemaEditor = ({ name }: FieldProps) => {
  const field = useField(name);
  const { t } = useTranslation('workspaces');

  return (
    <div className="pr-form-field">
      <label className="pr-form-label">
        {t('pages.blocks.form.schema.label')}
      </label>
      <div className="pr-form-description">
        <Tooltip
          title={t('pages.blocks.form.schema.description')}
          placement="left"
        >
          <InfoCircleOutlined />
        </Tooltip>
      </div>
      <div className="absolute -top-2 -right-2">
        <Tooltip title={t('pages.blocks.form.schema.add')} placement="left">
          <Button
            onClick={() =>
              field.input.onChange({
                ...field.input.value,
                properties: {
                  ...field.input.value.properties,
                  '': { type: 'string' },
                },
              })
            }
          >
            <PlusOutlined />
          </Button>
        </Tooltip>
      </div>
      <div className="pr-form-input">
        <Properties
          value={field.input.value.properties}
          onChange={(v: Record<string, Schema>) =>
            field.input.onChange({
              type: 'object',
              properties: v,
            })
          }
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
      description: 'pages.blocks.form.submitLabel.description',
    },
    hideSubmit: {
      type: 'boolean',
      title: 'pages.blocks.form.hideSubmit.label',
      description: 'pages.blocks.form.hideSubmit.description',
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
    disabledSubmit: {
      type: 'boolean',
      title: 'pages.blocks.form.disabledSubmit.label',
      description: 'pages.blocks.form.disabledSubmit.description',
    },
  },
};

export default schema;
