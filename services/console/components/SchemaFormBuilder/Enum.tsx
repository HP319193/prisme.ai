import { DeleteOutlined } from '@ant-design/icons';
import { Button, Input, SchemaFormDescription } from '@prisme.ai/design-system';
import { ChangeEvent, useCallback, useMemo } from 'react';

interface Value {
  enum?: string[];
  enumNames?: string[];
}
interface EnumProps {
  value: Value;
  onChange: (v: Value) => void;
}
export const Enum = ({ value, onChange }: EnumProps) => {
  const addValue = useCallback(() => {
    const newValue = { enum: value.enum || [] };
    const index = newValue.enum.push('');
    if (value.enumNames && !value.enumNames[index]) {
      value.enumNames[index] = '';
    }
    onChange(newValue);
  }, [onChange, value.enum, value.enumNames]);

  const deleteValue = useCallback(
    (index: number) => () => {
      const newEnum = (value.enum || []).filter((v, k) => k !== index);
      const newEnumNames = (value.enumNames || []).filter(
        (v, k) => k !== index
      );
      const newValue: any = {};
      if (newEnum.length) {
        newValue.enum = newEnum;
      }
      if (newEnumNames.length) {
        newValue.enumNames = newEnumNames;
      }

      onChange(newValue);
    },
    [onChange, value.enum, value.enumNames]
  );

  const updateValue = useCallback(
    (index: number) => ({
      target: { value: v },
    }: ChangeEvent<HTMLInputElement>) => {
      const newValue = { enum: value.enum || [] };
      newValue.enum[index] = v;
      onChange(newValue);
    },
    [onChange, value.enum]
  );
  const updateLabel = useCallback(
    (index: number) => ({
      target: { value: v },
    }: ChangeEvent<HTMLInputElement>) => {
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
    <SchemaFormDescription text="wesh" className="flex-1 flex-col">
      <label className="text-[10px] text-gray">
        Liste de valeurs spécifiques
      </label>
      <div>
        {(value.enum || []).map((v, k) => (
          <div
            key={k}
            className="relative flex flex-1 flex-row items-center mb-2"
          >
            <Input label="value" value={v} onChange={updateValue(k)} />
            <span className="flex m-1">:</span>
            <Input
              label="label"
              placeholder={(value.enumNames || [])[k] || v}
              value={(value.enumNames || [])[k]}
              onChange={updateLabel(k)}
            />
            <button
              type="button"
              className="absolute top-[50%] right-2 text-neutral-500 text-xs"
              onClick={deleteValue(k)}
            >
              <DeleteOutlined />
            </button>
          </div>
        ))}
      </div>
      <Button type="button" onClick={addValue}>
        Ajouter une valeur
      </Button>
    </SchemaFormDescription>
  );
};

export default Enum;
