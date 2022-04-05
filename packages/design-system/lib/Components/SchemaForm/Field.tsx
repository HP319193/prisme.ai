import { useMemo } from 'react';
import { useSchemaForm } from './context';
import FieldAny from './FieldAny';
import FieldArray from './FieldArray';
import FieldBoolean from './FieldBoolean';
import FieldDate from './FieldDate';
import FieldLocalizedBoolean from './FieldLocalizedBoolean';
import FieldLocalizedText from './FieldLocalizedText';
import FieldObject from './FieldObject';
import FieldSelect from './FieldSelect';
import FieldText from './FieldText';
import OneOf from './OneOf';
import { FieldProps } from './types';

export const Field = (props: FieldProps) => {
  const { components } = useSchemaForm();
  const Component = useMemo(() => {
    if (props.schema.oneOf) {
      return OneOf;
    }
    const { 'ui:widget': UiWidget } = props.schema;
    if (typeof UiWidget === 'function') {
      return UiWidget;
    }

    if (UiWidget === 'select') {
      return components.FieldSelect || FieldSelect;
    }

    if (UiWidget === 'date' && props.schema.type === 'string') {
      return components.FieldDate || FieldDate;
    }

    switch (props.schema.type) {
      case 'localized:string':
      case 'localized:number':
        return components.FieldLocalizedText || FieldLocalizedText;
      case 'string':
      case 'number':
        return components.FieldText || FieldText;
      case 'boolean':
        return components.FieldBoolean || FieldBoolean;
      case 'localized:boolean':
        return components.FieldLocalizedBoolean || FieldLocalizedBoolean;
      case 'object':
        return components.FieldObject || FieldObject;
      case 'array':
        return components.FieldArray || FieldArray;
      default:
        return components.FieldAny || FieldAny;
    }
  }, [props.schema]);

  return <Component {...props} />;
};
export default Field;
