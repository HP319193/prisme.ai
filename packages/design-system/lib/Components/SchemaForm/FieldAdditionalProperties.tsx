import { DeleteOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FieldRenderProps, useField } from 'react-final-form';
import Button from '../Button';
import Input from '../Input';
import TextArea from '../TextArea';
import { SchemaFormContext, useSchemaForm } from './context';
import Field from './Field';
import { FieldProps, Schema } from './types';
import { getDefaultValue } from './utils';

interface AdditionalPropertiesProps extends FieldProps {
  field: FieldRenderProps<any, HTMLElement, any>;
}

const TextAreaField: SchemaFormContext['components']['JSONEditor'] = ({
  value,
  onChange,
}) => {
  return (
    <TextArea
      onChange={({ target: { value } }) => onChange(value)}
      defaultValue={
        typeof value === 'string' ? value : JSON.stringify(value, null, '  ')
      }
    />
  );
};

const cleanValue = (schema: Schema, value: any) => {
  const keys = Object.keys(schema.properties || {});
  return Object.keys(value || {}).reduce(
    (prev, key) =>
      keys.includes(key)
        ? prev
        : {
            ...prev,
            [key]: value[key],
          },
    {}
  );
};
const getInitialValue = (schema: Schema, value: any) => {
  if (typeof value === 'string') return value;
  return JSON.stringify(cleanValue(schema, value), null, '  ');
};

export const FreeAdditionalProperties = ({
  schema,
  field,
}: AdditionalPropertiesProps) => {
  const [value, setValue] = useState(
    getInitialValue(schema, field.input.value)
  );
  const {
    components: { JSONEditor = TextAreaField },
  } = useSchemaForm();
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
    <JSONEditor
      onChange={(value) =>
        typeof value === 'string'
          ? setValue(value)
          : setValue(value.target.value)
      }
      value={value}
    />
  );
};

export const ManagedAdditionalProperties = ({
  schema,
  field,
  name,
}: AdditionalPropertiesProps) => {
  const [value, setValue] = useState<Record<string, any>>(field.input.value);
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
        <div key={index} className="flex flex-1 flex-row items-start">
          <Input
            value={key}
            onChange={({ target: { value } }) => updateKey(key)(value)}
            label={locales.propertyKey || 'Key'}
          />
          <span className="mt-[2rem]"> : </span>
          <div className="mt-[1rem] flex flex-1">
            <Field
              schema={{
                ...(schema.additionalProperties as Schema),
                disabled: key ? undefined : true,
              }}
              label={
                locales.propertyValue === undefined
                  ? 'Value'
                  : locales.propertyValue
              }
              name={`${name}.${key}`}
            />
          </div>

          <Tooltip
            title={
              (schema.additionalProperties as Schema)?.remove ||
              locales.removeProperty ||
              'Remove'
            }
            placement="left"
          >
            <Button onClick={removeKey(key)} className="!px-1">
              <DeleteOutlined />
            </Button>
          </Tooltip>
        </div>
      ))}
      <Button onClick={addKey}>
        {(schema.additionalProperties as Schema)?.add ||
          locales.addProperty ||
          'Add a property'}
      </Button>
    </div>
  );
};

export const FieldAdditionalProperties = ({ schema, name }: FieldProps) => {
  const field = useField(name);
  const {
    components: {
      FreeAdditionalProperties: Free = FreeAdditionalProperties,
      ManagedAdditionalProperties: Managed = ManagedAdditionalProperties,
    },
  } = useSchemaForm();

  if (!schema || !schema.additionalProperties) return null;

  if (schema.additionalProperties === true) {
    return <Free field={field} schema={schema} name={name} />;
  }

  return <Managed schema={schema} field={field} name={name} />;
};

export default FieldAdditionalProperties;
