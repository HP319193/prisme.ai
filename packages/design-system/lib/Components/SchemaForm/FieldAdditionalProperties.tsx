import { DeleteOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useField, FieldRenderProps } from 'react-final-form';
import Button from '../Button';
import Input from '../Input';
import TextArea from '../TextArea';
import { useSchemaForm } from './context';
import Field from './Field';
import { FieldProps, Schema } from './types';
import { getDefaultValue } from './utils';

interface AdditionalPropertiesProps extends FieldProps {
  field: FieldRenderProps<any, HTMLElement, any>;
}

const FreeAdditionalProperties = ({
  schema,
  field,
}: AdditionalPropertiesProps) => {
  const [value, setValue] = useState('');
  useEffect(() => {
    try {
      const json = JSON.parse(value);
      const keys = Object.keys(schema.properties || {});
      const cleanedValue = Object.keys(field.input.value || {}).reduce(
        (prev, key) =>
          keys.includes(key)
            ? {
                ...prev,
                [key]: field.input.value[key],
              }
            : prev,
        {}
      );
      field.input.onChange({
        ...cleanedValue,
        ...json,
      });
    } catch {
      //
    }
  }, [value]);

  return (
    <TextArea
      onChange={({ target: { value } }) => setValue(value)}
      defaultValue={
        typeof value === 'string' ? value : JSON.stringify(value, null, '  ')
      }
    />
  );
};

const ManagedAdditionalProperties = ({
  schema,
  field,
  name,
}: AdditionalPropertiesProps) => {
  const [value, setValue] = useState<Record<string, any>>({});
  const { locales = {} } = useSchemaForm();

  const lock = useRef(false);

  useEffect(() => {
    if (lock.current) {
      lock.current = false;
      return;
    }
    const keys = Object.keys(schema.properties || {});
    const cleanedValue = Object.keys(field.input.value || {}).reduce(
      (prev, key) =>
        keys.includes(key)
          ? {
              ...prev,
              [key]: field.input.value[key],
            }
          : prev,
      {}
    );

    lock.current = true;
    field.input.onChange({
      ...cleanedValue,
      ...value,
    });
  }, [value]);

  useEffect(() => {
    if (lock.current) {
      lock.current = false;
      return;
    }
    setValue(() => {
      const keys = Object.keys(schema.properties || {});
      const cleanedValue = Object.keys(field.input.value || {}).reduce(
        (prev, key) =>
          keys.includes(key)
            ? prev
            : {
                ...prev,
                [key]: field.input.value[key],
              },
        {}
      );
      return cleanedValue;
    });
  }, [field.input.value]);

  const addKey = useCallback(() => {
    setValue((value) =>
      value.hasOwnProperty('')
        ? value
        : {
            ...value,
            '': getDefaultValue((schema.additionalProperties as Schema).type),
          }
    );
  }, []);

  const updateKey = useCallback(
    (prevKey: string) => (newKey: string) => {
      setValue((value) =>
        Object.keys(value).reduce(
          (prev, key) => ({
            ...prev,
            [key === prevKey ? newKey : key]: value[key],
          }),
          {}
        )
      );
    },
    []
  );

  const removeKey = useCallback(
    (prevKey: string) => () => {
      setValue((value) =>
        Object.keys(value).reduce(
          (prev, key) =>
            key === prevKey
              ? prev
              : {
                  ...prev,
                  [key]: value[key],
                },
          {}
        )
      );
    },
    []
  );

  return (
    <div>
      {Object.keys(value).map((key, index) => (
        <div key={index} className="flex flex-1 flex-row items-center">
          <Input
            containerClassName="flex flex-1"
            value={key}
            onChange={({ target: { value } }) => updateKey(key)(value)}
            label={locales.propertyKey || 'Key'}
          />
          {' : '}
          {key && (
            <Field
              schema={schema.additionalProperties as Schema}
              label={
                locales.propertyValue === undefined
                  ? 'Value'
                  : locales.propertyValue
              }
              name={`${name}.${key}`}
            />
          )}

          <Button onClick={removeKey(key)}>
            <Tooltip
              title={locales.removeProperty || 'Remove'}
              placement="left"
            >
              <button>
                <DeleteOutlined />
              </button>
            </Tooltip>
          </Button>
        </div>
      ))}
      <Button onClick={addKey}>
        {locales.addProperty || 'Add a property'}
      </Button>
    </div>
  );
};

export const FieldAdditionalProperties = ({ schema, name }: FieldProps) => {
  const field = useField(name);

  if (!schema || !schema.additionalProperties) return null;

  if (schema.additionalProperties === true) {
    return (
      <FreeAdditionalProperties field={field} schema={schema} name={name} />
    );
  }

  return (
    <ManagedAdditionalProperties schema={schema} field={field} name={name} />
  );
};

export default FieldAdditionalProperties;
