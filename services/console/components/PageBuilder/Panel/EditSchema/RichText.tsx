import { InfoCircleOutlined } from '@ant-design/icons';
import { FieldProps, Schema, schemaFormUtils } from '@prisme.ai/design-system';
import { Tooltip } from 'antd';
import { useField } from 'react-final-form';
import LocalizedInput from '../../../LocalizedInput';
import RichTextEditor from '../../../RichTextEditor';
import commonSchema from './commonSchema';

const Editor = ({ name, schema, label }: FieldProps) => {
  const field = useField(name);
  const {
    input: { value: allowScripts },
  } = useField('values.allowScripts');

  return (
    <div className="pr-form-field">
      <label className="pr-form-label">
        {label || schema.title || schemaFormUtils.getLabel(name)}
      </label>
      {schema.description && (
        <Tooltip title={schema.description} placement="right">
          <button type="button" className="pr-form-description">
            <InfoCircleOutlined />
          </button>
        </Tooltip>
      )}
      <div className="pr-form-input">
        <LocalizedInput
          Input={RichTextEditor}
          InputProps={{ htmlModeOnly: allowScripts }}
          {...field.input}
          unmountOnLangChange
        />
      </div>
    </div>
  );
};

const schema: Schema = {
  type: 'object',
  properties: {
    content: {
      type: 'localized:string',
      title: 'pages.blocks.richtext.settings.content.label',
      description: 'pages.blocks.richtext.settings.content.description',
      'ui:widget': Editor,
    },
    allowScripts: {
      type: 'boolean',
      title: 'pages.blocks.richtext.settings.allowScripts.label',
      description: 'pages.blocks.richtext.settings.allowScripts.description',
    },
    ...commonSchema.properties,
  },
};

export default schema;
