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

export const UIWidgetsForString = [
  'upload',
  'textarea',
  'date',
  'select',
  'color',
  'autocomplete',
  'radio',
] as const;
export const UIWidgetsForLocalizedString = ['textarea'];
export const UIWidgetsByType = {
  [schemaTypes[0]]: UIWidgetsForString,
  [schemaTypes[1]]: UIWidgetsForLocalizedString,
};
export type UIWidgets = typeof UIWidgetsForString[number];

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
export type UiOptionsDynamicAutocomplete = {
  autocomplete: string;
};
export type UiOptionsAutocomplete = {
  autocomplete: {
    options: {
      label: string | ReactNode;
      value?: any;
      options?: { label: string | ReactNode; value?: any }[];
    }[];
  };
};
export type UiOptionsDate = {
  date: DatePickerProps;
};
export interface Schema extends Record<string, any> {
  // Field type
  type?: SchemaTypes;
  // Field label
  title?: string;
  // Description in a help tooltip
  description?: string;
  // Input placeholder
  placeholder?: string;
  // Add button label when in a list of items or properties
  add?: string;
  // Remove button label when in a list of items or properties
  remove?: string;
  // For object type, object properties
  properties?: Record<string, Schema>;
  // Schema of object additional properties
  additionalProperties?: boolean | Schema;
  // For array type, schema of array items
  items?: Schema;
  // List of different schemas available
  oneOf?: Schema[];
  // Value of the oneOf field.
  value?: any;
  // List of constrainted values
  enum?: any[];
  // Labels of constrainted values
  enumNames?: string[];
  // Default value
  default?: any;
  // Do not display the field
  hidden?: true;
  // Disable the field
  disabled?: true;
  // Validation by regexp
  pattern?: string;
  // Validation errors messages
  errors?: Record<string, string>;
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
    | UiOptionsDate
    | UiOptionsAutocomplete
    | UiOptionsDynamicAutocomplete
    | Record<string, any>;
}

export interface FieldProps {
  schema: Schema;
  name: string;
  label?: string;
}
