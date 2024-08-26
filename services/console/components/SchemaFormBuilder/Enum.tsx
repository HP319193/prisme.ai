import {
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  SchemaForm,
  Tooltip,
  UiOptionsSelect,
} from '@prisme.ai/design-system';
import { Input } from 'antd';
import { useTranslation } from 'next-i18next';
import { ChangeEvent, useCallback } from 'react';

interface Value {
  enum?: string[];
  enumNames?: string[];
  'ui:options'?: { select: Omit<UiOptionsSelect['select'], 'options'> };
}
interface EnumProps {
  value: Value;
  onChange: (v: Value) => void;
}
export const Enum = ({ value, onChange }: EnumProps) => {
  const { t } = useTranslation('common');
  const addValue = useCallback(() => {
    const newValue = { ...value, enum: value.enum || [] };
    const index = newValue.enum.push('');
    if (value.enumNames && !value.enumNames[index]) {
      value.enumNames[index] = '';
    }
    onChange(newValue);
  }, [onChange, value]);

  const deleteValue = useCallback(
    (index: number) => () => {
      const newEnum = (value.enum || []).filter((v, k) => k !== index);
      const newEnumNames = (value.enumNames || []).filter(
        (v, k) => k !== index
      );
      const { enum: _enum, enumNames, ...prevValue } = value;
      const newValue: any = prevValue;
      if (newEnum.length) {
        newValue.enum = newEnum;
      }
      if (newEnumNames.length) {
        newValue.enumNames = newEnumNames;
      }

      onChange(newValue);
    },
    [onChange, value]
  );

  const updateValue = useCallback(
    (index: number) =>
      ({ target: { value: v } }: ChangeEvent<HTMLInputElement>) => {
        const newValue = { ...value, enum: value.enum || [] };
        newValue.enum[index] = v;
        onChange(newValue);
      },
    [onChange, value]
  );
  const updateLabel = useCallback(
    (index: number) =>
      ({ target: { value: v } }: ChangeEvent<HTMLInputElement>) => {
        const newEnumNames = [...(value.enumNames || [])];
        newEnumNames[index] = v;
        onChange({
          ...value,
          enumNames: newEnumNames.map((v) => v || ''),
        });
      },
    [onChange, value]
  );

  return (
    <div className="flex-1 flex-col">
      <div className="flex flex-1 flex-row justify-between">
        <div>
          <label className="font-bold">
            {t('schemaForm.builder.property.enum.label')}
          </label>
          <Tooltip
            title={t('schemaForm.builder.property.enum.description')}
            placement="right"
          >
            <button type="button" className="ml-2">
              <InfoCircleOutlined />
            </button>
          </Tooltip>
        </div>
        <Tooltip
          title={t('schemaForm.builder.property.enum.add')}
          placement="left"
        >
          <Button type="button" onClick={addValue} className="-mt-2">
            <PlusOutlined />
          </Button>
        </Tooltip>
      </div>
      <div>
        {(value.enum || []).map((v, k) => (
          <div
            key={k}
            className="relative flex flex-1 flex-row items-center mb-2"
          >
            <Input
              placeholder={t('schemaForm.builder.property.enum.key')}
              value={(value.enumNames || [])[k]}
              onChange={updateLabel(k)}
            />
            <span className="flex m-1">:</span>
            <Input
              placeholder={t('schemaForm.builder.property.enum.value')}
              value={v}
              onChange={updateValue(k)}
            />
            <Tooltip title={t('schemaForm.builder.property.enum.remove')}>
              <button
                type="button"
                className="absolute top-[50%] right-2 text-neutral-500 text-xs"
                onClick={deleteValue(k)}
              >
                <DeleteOutlined />
              </button>
            </Tooltip>
          </div>
        ))}
      </div>
      <SchemaForm
        schema={{
          type: 'boolean',
          title: t('schemaForm.builder.uiOptions.select.hideSearch.title'),
        }}
        buttons={[]}
        initialValues={value}
        onChange={(formVal) => {
          onChange({
            ...value,
            'ui:options': {
              ...(value?.['ui:options'] || {}),
              select: {
                ...(value?.['ui:options']?.select || {}),
                hideSearch: formVal,
              },
            },
          });
        }}
      />
    </div>
  );
};

export default Enum;
