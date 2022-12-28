import { DeleteOutlined } from '@ant-design/icons';
import { Input, Tooltip } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FieldRenderProps, useField } from 'react-final-form';
import Button from '../Button';
import TextArea from '../TextArea';
import { SchemaFormContext, useSchemaForm } from './context';
import Field from './Field';
import FieldContainer from './FieldContainer';
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
  JSONEditor = TextAreaField,
  locales,
  ...props
}: AdditionalPropertiesProps & {
  JSONEditor: SchemaFormContext['components']['JSONEditor'];
  locales: SchemaFormContext['locales'];
}) => {
  const [value, setValue] = useState(
    getInitialValue(props.schema, props.field.input.value)
  );
  useEffect(() => {
    try {
      const json = JSON.parse(value);
      const keys = Object.keys(props.schema.properties || {});
      const cleanedValue = Object.keys(props.field.input.value || {}).reduce(
        (prev, key) =>
          keys.includes(key)
            ? {
                ...prev,
                [key]: props.field.input.value[key],
              }
            : prev,
        {}
      );
      props.field.input.onChange({
        ...cleanedValue,
        ...json,
      });
    } catch {
      //
    }
  }, [value]);

  return (
    <FieldContainer
      {...props}
      className="pr-form-additional-properties pr-form-additional-properties--free"
    >
      {locales.freeAdditionalPropertiesLabel && (
        <label>{locales.freeAdditionalPropertiesLabel}</label>
      )}
      <JSONEditor
        onChange={(value) =>
          typeof value === 'string'
            ? setValue(value)
            : setValue(value.target.value)
        }
        value={value}
      />
    </FieldContainer>
  );
};

export const ManagedAdditionalProperties = (
  props: AdditionalPropertiesProps & { locales: SchemaFormContext['locales'] }
) => {
  const [value, setValue] = useState<Record<string, any>>(
    props.field.input.value
  );

  useEffect(() => {
    setValue(() => {
      const keys = Object.keys(props.schema.properties || {});
      const cleanedValue = Object.keys(props.field.input.value || {}).reduce(
        (prev, key) =>
          keys.includes(key)
            ? prev
            : {
                ...prev,
                [key]: props.field.input.value[key],
              },
        {}
      );
      return cleanedValue;
    });
  }, [props.field.input.value]);

  const addKey = useCallback(() => {
    setValue((value) =>
      value.hasOwnProperty('')
        ? value
        : {
            ...value,
            '': getDefaultValue(
              (props.schema.additionalProperties as Schema).type
            ),
          }
    );
  }, []);

  const updateKey = useCallback(
    (prevKey: string) => (newKey: string) => {
      const newValue = Object.entries(value).reduce(
        (prev, [key, v]) => ({
          ...prev,
          [key === prevKey ? newKey : key]: v,
        }),
        {}
      );
      setValue(newValue);
      if (!newKey) return;
      props.field.input.onChange(newValue);
    },
    [value, props.field]
  );

  const removeKey = useCallback(
    (prevKey: string) => () => {
      const newValue = Object.entries(value)
        .filter(([key]) => key)
        .reduce(
          (prev, [key, v]) =>
            key === prevKey
              ? prev
              : {
                  ...prev,
                  [key]: v,
                },
          {}
        );
      setValue(newValue);
      props.field.input.onChange(newValue);
    },
    [value, props.field]
  );

  return (
    <FieldContainer {...props} className="pr-form-additional-properties">
      {Object.entries(value).map(([key, value], index) => (
        <div
          key={index}
          className="pr-form-additional-properties__property pr-form-input"
        >
          <div className="pr-form-additional-properties__property-key">
            <label className="pr-form-label">
              {props.locales.propertyKey || 'Key'}
            </label>
            <Input
              value={key}
              onChange={({ target: { value } }) => updateKey(key)(value)}
              disabled={value}
            />
          </div>
          <span className="pr-form-additional-properties__property-separator">
             : 
          </span>
          <div className="pr-form-additional-properties__property-value">
            <Field
              schema={{
                ...(props.schema.additionalProperties as Schema),
                disabled: key ? undefined : true,
              }}
              label={
                props.locales.propertyValue === undefined
                  ? 'Value'
                  : props.locales.propertyValue
              }
              name={`${props.name}.${key || 'EMPTY'}`}
            />
          </div>

          <Tooltip
            title={
              (props.schema.additionalProperties as Schema)?.remove ||
              props.locales.removeProperty ||
              'Remove'
            }
            placement="left"
          >
            <Button
              onClick={removeKey(key)}
              className="pr-form-additional-properties__property-delete"
            >
              <DeleteOutlined />
            </Button>
          </Tooltip>
        </div>
      ))}
      <Button onClick={addKey}>
        {(props.schema.additionalProperties as Schema)?.add ||
          props.locales.addProperty ||
          'Add a property'}
      </Button>
    </FieldContainer>
  );
};

export const FieldAdditionalProperties = ({ schema, name }: FieldProps) => {
  const field = useField(name);
  const {
    locales,
    components: {
      FreeAdditionalProperties: Free = FreeAdditionalProperties,
      ManagedAdditionalProperties: Managed = ManagedAdditionalProperties,
      JSONEditor,
    },
  } = useSchemaForm();

  if (!schema || !schema.additionalProperties) return null;

  if (schema.additionalProperties === true) {
    return (
      <Free
        field={field}
        schema={schema}
        name={name}
        JSONEditor={JSONEditor}
        locales={locales}
      />
    );
  }
  console.log(locales);
  return (
    <Managed schema={schema} field={field} name={name} locales={locales} />
  );
};

export default FieldAdditionalProperties;
