import { DeleteOutlined } from '@ant-design/icons';
import { Button, Input, Tooltip } from '@prisme.ai/design-system';
import { ReactNode, useCallback } from 'react';

interface ObjectInputProps {
  value: Record<string, string>;
  onChange: (v: ObjectInputProps['value']) => void;
  label?: string | ReactNode;
  keyLabel?: string;
  valueLabel?: string;
  removeLabel?: string;
  deleteIconClassName?: string;
}

const EMPTY_VALUE = {};

export const ObjectInput = ({
  value = EMPTY_VALUE,
  onChange,
  label,
  keyLabel,
  valueLabel,
  removeLabel,
  deleteIconClassName = '',
}: ObjectInputProps) => {
  const updateKey = useCallback(
    (prevKey: string) => (newKey: string) => {
      onChange(
        Object.entries(value).reduce(
          (prev, [k, v]) => ({
            ...prev,
            [k === prevKey ? newKey : k]: v,
          }),
          {}
        )
      );
    },
    [onChange, value]
  );
  const updateValue = useCallback(
    (key: string) => (newValue: string) => {
      onChange(
        Object.entries(value).reduce(
          (prev, [k, v]) => ({
            ...prev,
            [k]: k === key ? newValue : v,
          }),
          {}
        )
      );
    },
    [onChange, value]
  );
  const removeKey = useCallback(
    (key: string) => () => {
      onChange(
        Object.entries(value).reduce(
          (prev, [k, v]) =>
            k === key
              ? prev
              : {
                  ...prev,
                  [k]: v,
                },
          {}
        )
      );
    },
    [onChange, value]
  );
  return (
    <div className={`flex flex-1 flex-col`}>
      {label}
      {Object.entries(value).map(([key, v], index) => (
        <div key={index} className="flex flex-1 flex-row items-baseline">
          <Input
            value={key}
            onChange={({ target: { value } }) => updateKey(key)(value)}
            label={keyLabel}
            containerClassName="!flex-initial"
          />
          <span className="mt-[2rem]"> : </span>
          <div className="mt-[1rem] flex flex-1">
            <Input
              value={v}
              onChange={({ target: { value } }) => updateValue(key)(value)}
              label={valueLabel}
            />
            <Tooltip title={removeLabel} placement="left">
              <Button onClick={removeKey(key)} className="!px-1">
                <DeleteOutlined className={deleteIconClassName} />
              </Button>
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ObjectInput;
