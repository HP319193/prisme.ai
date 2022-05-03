import { ReactElement, ReactNode } from 'react';
import { DatePickerProps } from '../DatePicker';
import { TextAreaProps } from '../TextArea';

export const schemaTypes = [
  'string',
  'localized:string',
  'number',
  'localized:number',
  'boolean',
  'localized:boolean',
  'object',
  'array',
] as const;
export type SchemaTypes = typeof schemaTypes[number];

export type UIWidgets = 'upload' | 'textarea' | 'select' | 'date';

export type UiOptionsGrid = {
  grid: string[][][];
};
export type UiOptionsOneOf = {
  oneOf: {
    options: {
      label: string;
      index: number;
      value?: Record<string, any>;
    }[];
  };
};
export type UiOptionsArray = {
  array: 'row';
};

export type UiOptionsTextArea = {
  textarea: Omit<TextAreaProps, 'value'>;
};
export type UiOptionsUpload = {
  upload: {
    // https://developer.mozilla.org/fr/docs/Web/HTML/Element/Input/file#accept
    accept?: string;
  };
};
export type UiOptionsSelect = {
  select: {
    options: {
      label: string | ReactNode;
      value: any;
    }[];
  };
};
export type UiOptionsDate = {
  date: DatePickerProps;
};
export interface Schema {
  // Field type
  type?: SchemaTypes;
  // Field label
  title?: string;
  // Description in a help tooltip
  description?: string;
  // For object type, object properties
  properties?: Record<string, Schema>;
  // Schema of object additional properties
  additionalProperties?: boolean | Schema;
  // For array type, schema of array items
  items?: Schema;
  // List of different schemas available
  oneOf?: Schema[];
  // List of constrainted values
  enum?: any[];
  // Labels of constrainted values
  enumNames?: string[];
  // Do not display the field
  hidden?: true;
  // Validation by regexp
  pattern?: string;
  // Custom widget
  'ui:widget'?: UIWidgets | ((props: any) => ReactElement);
  // Options for UI components
  'ui:options'?:
    | UiOptionsGrid
    | UiOptionsOneOf
    | UiOptionsArray
    | UiOptionsTextArea
    | UiOptionsUpload
    | UiOptionsSelect
    | UiOptionsDate;
}

export interface FieldProps {
  schema: Schema;
  name: string;
  label?: string;
}
