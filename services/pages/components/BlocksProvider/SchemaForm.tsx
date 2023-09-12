import {
  SchemaForm as OriginalSchemaForm,
  schemaFormUtils,
  Tooltip,
  SchemaFormField,
} from '@prisme.ai/design-system';
import RichTextEditor from '../../../console/components/RichTextEditor';
import BlockWidget from './BlockWidget';
import { CodeEditorInline } from '../../../console/components/CodeEditor/lazy';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useField } from 'react-final-form';
import { InfoCircleOutlined } from '@ant-design/icons';
import { SchemaFormContext } from '@prisme.ai/design-system/lib/Components/SchemaForm/context';
import { FieldComponentProps } from '@prisme.ai/design-system/lib/Components/SchemaForm/Field';
import { useBlock } from '@prisme.ai/blocks';
import { get } from 'lodash';

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

const Field = (props: FieldComponentProps) => {
  const { 'ui:options': UiOptions } = props.schema;
  const { events } = useBlock();
  const field = useField(props.name);
  const { updateValue: { event = '', selector = '' } = {} } = (UiOptions ||
    {}) as any;

  useEffect(() => {
    if (!event) return;
    const off = events?.on(event, ({ payload }) => {
      field.input.onChange(selector ? get({ payload }, selector) : payload);
    });
    return off;
  }, [event, selector, events, field]);

  return <SchemaFormField {...props} />;
};
const components = {
  Field,
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
