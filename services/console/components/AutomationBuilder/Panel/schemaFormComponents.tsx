import { InfoCircleOutlined } from '@ant-design/icons';
import {
  FieldProps,
  getSchemaFormLabel,
  SchemaFormDescription,
  Tooltip,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback, useMemo, useState } from 'react';
import { useField } from 'react-final-form';
import { CodeEditorInline } from '../../CodeEditor/lazy';
import FieldContainerWithRaw from '../../FieldContainerWithRaw';

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

  return (
    <div className="flex flex-1 flex-col my-2">
      <SchemaFormDescription text={schema.description}>
        <label className="text-[10px] text-gray">
          {label || schema.title || getSchemaFormLabel(name)}
        </label>
        <CodeEditorInline
          value={value}
          onChange={onChange}
          mode="json"
          style={codeStyle}
        />
        <div
          className={`flex items-center justify-end text-pr-orange text-xs mr-2 ${
            invalidJSON ? '' : 'invisible'
          }`}
        >
          <Tooltip title={t('automations.instruction.anyFieldErrorTooltip')}>
            <div>
              {t('automations.instruction.anyFieldError')}
              <InfoCircleOutlined className="ml-2" />
            </div>
          </Tooltip>
        </div>
      </SchemaFormDescription>
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
};
export default components;
