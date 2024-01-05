import { useEffect, useMemo, useRef, useState } from 'react';
import { Form, useField } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { SchemaFormContext, useSchemaForm } from './context';
import Enum from './Enum';
import OneOf from './OneOf';
import { FieldProps } from './types';
import { getFieldOptions } from './utils';
import { OnChange } from 'react-final-form-listeners';

export interface FieldComponentProps extends FieldProps {
  components: SchemaFormContext['components'];
}

export const Field = ({ components, ...props }: FieldComponentProps) => {
  const field = useField(props.name, getFieldOptions(props.schema));

  // Update value with default value
  const [_default, setDefault] = useState();
  useEffect(() => {
    if (!_default && props.schema.default) {
      setDefault(props.schema.default);
    }
  }, [_default, props.schema.default]);
  useEffect(() => {
    if (!_default || field.input.value !== undefined) {
      return;
    }
    field.input.onChange(_default);
  }, [_default]);

  const Component = useMemo(() => {
    if (props.schema.oneOf) {
      return OneOf;
    }
    const { 'ui:widget': UiWidget } = props.schema;
    if (typeof UiWidget === 'function') {
      return UiWidget;
    }

    if (UiWidget && components.UiWidgets && components.UiWidgets[UiWidget]) {
      return components.UiWidgets[UiWidget];
    }

    // This widget can be used with any type
    if (UiWidget === 'select') {
      return components.FieldSelect;
    }

    if (props.schema.enum) {
      return Enum;
    }

    switch (props.schema.type) {
      case 'localized:string':
      case 'localized:number':
        return components.FieldLocalizedText;
      case 'string':
      case 'number':
        return components.FieldText;
      case 'boolean':
        return components.FieldBoolean;
      case 'localized:boolean':
        return components.FieldLocalizedBoolean;
      case 'object':
        return components.FieldObject;
      case 'array':
        if (UiWidget === 'tags') {
          return components.FieldTags;
        }
        if (UiWidget === 'upload') {
          return components.FieldArrayUpload;
        }
        return components.FieldArray;
      default:
        return components.FieldAny;
    }
  }, [props.schema]);

  if (props.schema.hidden || !Component) return null;

  return <Component {...props} />;
};

const LinkedField = (props: FieldProps) => {
  const { components } = useSchemaForm();
  const { Field: FieldComponent = Field } = components;
  return <FieldComponent {...props} components={components} />;
};

export const SelfField = (
  props: Pick<FieldProps, 'schema' | 'label'> & {
    value: any;
    onChange: (v: any) => void;
  }
) => {
  const values = useRef({ values: props.value });
  return (
    <Form
      onSubmit={props.onChange}
      initialValues={values.current}
      mutators={{ ...arrayMutators }}
    >
      {() => (
        <>
          <OnChange name="values">
            {(value, previous) => {
              if (previous === value) return;
              props.onChange(value);
            }}
          </OnChange>
          <LinkedField {...props} name="values" />
        </>
      )}
    </Form>
  );
};

export default LinkedField;
