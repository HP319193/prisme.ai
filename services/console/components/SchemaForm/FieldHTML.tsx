import { InfoCircleOutlined } from '@ant-design/icons';
import { FieldProps, schemaFormUtils } from '@prisme.ai/design-system';
import { Tooltip } from 'antd';
import { useField } from 'react-final-form';
import RichTextEditor from '../RichTextEditor';

export const FieldHTML = ({ name, schema, label }: FieldProps) => {
  const field = useField(name);
  const { ['ui:options']: { html: { htmlModeOnly = false } = {} } = {} } =
    schema || {};

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
        <RichTextEditor {...field.input} htmlModeOnly={htmlModeOnly} />
      </div>
    </div>
  );
};
export default FieldHTML;
