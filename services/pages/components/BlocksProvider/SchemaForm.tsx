import {
  SchemaForm as OriginalSchemaForm,
  schemaFormUtils,
  Tooltip,
} from '@prisme.ai/design-system';
import RichTextEditor from '../../../console/components/RichTextEditor';
import BlockWidget from './BlockWidget';
import { CodeEditorInline } from '../../../console/components/CodeEditor/lazy';
import { useCallback, useMemo, useState } from 'react';
import { useField } from 'react-final-form';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  FieldComponent,
  SchemaFormContext,
} from '@prisme.ai/design-system/lib/Components/SchemaForm/context';

const FieldCode: SchemaFormContext['components']['FieldCode'] = ({
  schema,
  name,
  label,
  options,
}) => {
  const [invalidJSON, setInvalidJSON] = useState(false);

  const field = useField(name);
  const [value, setValue] = useState(
    typeof field.input.value === 'string'
      ? field.input.value
      : JSON.stringify(field.input.value, null, '  ')
  );
  const onChange = useCallback(
    (value: string) => {
      setValue(value);
      try {
        const json = JSON.parse(value);
        field.input.onChange(json);
        setInvalidJSON(false);
      } catch {
        field.input.onChange(value);
        setInvalidJSON(true);
      }
    },
    [field.input]
  );

  const codeStyle = useMemo(() => {
    const style: any = { flex: 'auto' };
    if (invalidJSON) style.border = 'solid #FF9261 1px';
    return style;
  }, [invalidJSON]);

  const mode = options?.code?.mode || 'json';

  return (
    <div className="pr-form-field">
      <label className="pr-form-label">
        {label || schema.title || schemaFormUtils.getLabel(name)}
      </label>
      <Tooltip title={schema.description} placement="right">
        <button type="button" className="pr-form-description">
          <InfoCircleOutlined />
        </button>
      </Tooltip>
      <div className="pr-form-input">
        <div className="flex flex-1">
          <CodeEditorInline
            value={value}
            onChange={onChange}
            mode={mode}
            style={codeStyle}
          />
        </div>
      </div>
    </div>
  );
};

const components = {
  HTMLEditor: RichTextEditor,
  UiWidgets: {
    block: BlockWidget,
  },
  FieldCode,
};

export const SchemaForm = ({
  ...props
}: Parameters<typeof OriginalSchemaForm>[0]) => {
  return <OriginalSchemaForm {...props} components={components} />;
};

export default SchemaForm;
