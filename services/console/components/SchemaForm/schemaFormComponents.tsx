import { InfoCircleOutlined } from '@ant-design/icons';
import { FieldProps, schemaFormUtils, Tooltip } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';
import { useField } from 'react-final-form';
import { CodeEditorInline } from '../CodeEditor/lazy';
import FieldContainerWithRaw from '../FieldContainerWithRaw';
import RichTextEditor from '../RichTextEditor';
import BlockSelector from './BlockSelector/BlockSelector';

export const FieldAny = ({ schema, name, label }: FieldProps) => {
  const { t } = useTranslation('workspaces');
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

  const hasError = invalidJSON
    ? t('automations.instruction.anyFieldError')
    : schemaFormUtils.getError(field.meta);

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
        <Tooltip
          title={hasError}
          overlayClassName={`pr-form-error${
            invalidJSON ? ' pr-form-error--warning' : ''
          }`}
        >
          <div className="flex flex-1">
            <CodeEditorInline
              value={value}
              onChange={onChange}
              mode="json"
              style={codeStyle}
            />
          </div>
        </Tooltip>
      </div>
    </div>
  );
};
const JSONEditor = (props: any) => (
  <CodeEditorInline mode="json" {...props} style={{ flex: 'auto' }} />
);

const components = {
  FieldAny,
  FieldContainer: FieldContainerWithRaw,
  JSONEditor,
  FreeAdditionalProperties: FieldAny,
  HTMLEditor: RichTextEditor,
  UiWidgets: {
    blockSelector: BlockSelector,
  },
};
export default components;
