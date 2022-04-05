import { ReactElement } from 'react';
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
      label: string;
      value: any;
    }[];
  };
};
export type UiOptionsDate = {
  date: DatePickerProps;
};
export interface Schema {
  type?: SchemaTypes;
  title?: string;
  description?: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  additionalProperties?: boolean | Schema;
  oneOf?: Schema[];
  pattern?: string;
  'ui:widget'?: UIWidgets | ((props: any) => ReactElement);
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
