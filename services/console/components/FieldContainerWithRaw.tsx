import { CodeFilled, CodeOutlined } from '@ant-design/icons';
import { FieldProps, Schema, Tooltip } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { FC, useCallback, useState } from 'react';
import { useField } from 'react-final-form';
import { CodeEditorInline } from './CodeEditor/lazy';

1;

const typeIsOk = (value: any, type: Schema['type']) => {
  if (!type || !value) return true;

  const valueType = typeof value;

  switch (type) {
    case 'object':
      if (valueType === 'object') return true;
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
  }

  switch (valueType) {
    case 'string':
      return ['string', 'localized:string'].includes(type);
  }
  return true;
};

export const FieldContainerWithRaw: FC<FieldProps> = ({
  schema,
  name,
  label,
  children,
}) => {
  const { t } = useTranslation('workspaces');
  const field = useField(name);
  const [value, setValue] = useState(field.input.value);
  const [displayRaw, setDisplayRaw] = useState(
    !typeIsOk(field.input.value, schema.type)
  );

  const toggle = useCallback(() => {
    setDisplayRaw(!displayRaw);
    if (!displayRaw) {
      setValue(
        typeof field.input.value === 'string'
          ? field.input.value
          : JSON.stringify(field.input.value, null, '  ')
      );
    }
  }, [displayRaw, field.input.value]);

  const onChange = useCallback(
    (value: string) => {
      setValue(value);
      try {
        field.input.onChange(JSON.parse(value));
      } catch {
        field.input.onChange(value);
      }
    },
    [field.input]
  );

  return (
    <>
      <div className="flex flex-1 flex-col relative">
        <Tooltip title={t('form.raw', { context: displayRaw ? 'hide' : '' })}>
          <button
            className={`absolute top-0 mt-[0.35rem] ${
              schema.description ? 'right-8' : 'right-1'
            } flex flex-1 flex-row z-[1] text-[12px] items-center`}
            onClick={toggle}
          >
            {displayRaw ? <CodeFilled /> : <CodeOutlined />}
          </button>
        </Tooltip>

        <div className="space-y-5">{!displayRaw && children}</div>
      </div>
      {displayRaw && (
        <>
          <div className="!m-0">
            {label || schema.title || name.replace(/^values./, '')}
          </div>
          <div className="space-y-5">
            <CodeEditorInline
              mode="json"
              value={value}
              onChange={onChange}
              className="flex-auto"
            />
          </div>
        </>
      )}
    </>
  );
};

export default FieldContainerWithRaw;
