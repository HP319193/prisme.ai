import { useMemo, useRef } from 'react';
import { Form, useField } from 'react-final-form';
import { SchemaFormContext, useSchemaForm } from './context';
import Enum from './Enum';
import OneOf from './OneOf';
import { FieldProps } from './types';
import { getFieldOptions } from './utils';
import { OnChange } from 'react-final-form-listeners';

export const Field = ({
  components,
  ...props
}: FieldProps & { components: SchemaFormContext['components'] }) => {
  useField(props.name, getFieldOptions(props.schema));

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
  return <Field {...props} components={components} />;
};

export const SelfField = (
  props: Pick<FieldProps, 'schema' | 'label'> & {
    value: any;
    onChange: (v: any) => void;
  }
) => {
  const values = useRef({ values: props.value });
  return (
    <Form onSubmit={props.onChange} initialValues={values.current}>
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
