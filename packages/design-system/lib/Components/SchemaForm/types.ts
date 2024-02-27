import { FunctionComponent, ReactNode } from 'react';
import { DatePickerProps } from '../DatePicker';
import { TextAreaProps } from '../TextArea';
import { TagsOption } from '../Select';

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

export const defaultUploadAccept =
  'image/gif,image/jpeg,image/png,image/svg+xml,' as const;

export const UIWidgetsForString = [
  'upload',
  'textarea',
  'date',
  'select',
  'color',
  'autocomplete',
  'radio',
  'html',
  'slider',
  'code',
] as const;
export const UIWidgetsForLocalizedString = ['textarea'] as const;
export const UIWidgetsForNumber = ['slider'] as const;
export const UIWidgetsForArray = ['tags', 'upload'] as const;
export const UIWidgetsByType = {
  [schemaTypes[0]]: UIWidgetsForString,
  [schemaTypes[1]]: UIWidgetsForLocalizedString,
  [schemaTypes[2]]: UIWidgetsForNumber,
  [schemaTypes[3]]: UIWidgetsForNumber,
  [schemaTypes[7]]: UIWidgetsForArray,
};

type StringWithAutocomplete<T> = T | (string & {});
export type UIWidgets = StringWithAutocomplete<
  typeof UIWidgetsForString[number]
>;

export type UiOptionsCommon = {
  field: {
    updateValue?: false | 'blur';
  };
};

export type UIOptionsNumber = {
  number: {
    step?: number;
  };
};
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
    defaultPreview?: string | ReactNode;
  };
};
export type UiOptionsTags = {
  tags: {
    allowNew?: boolean;
    options: TagsOption[];
  };
};
export type UiOptionsSelect = {
  select: {
    options?: {
      label: string | ReactNode;
      value: any;
    }[];
    hideSearch?: boolean;
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
    minChars?: number;
  };
};
export type UiOptionsDate = {
  date: DatePickerProps;
};
export type UiOptionsHTML = {
  html: {
    htmlModeOnly?: boolean;
  };
};
export type UiOptionsSlider = {
  slider: {
    steps: {
      label: string;
      description: string;
      value: string | number;
      className?: string;
    }[];
    step?: number;
    showTooltip?: 'always' | 'hover';
  };
};
export type UiOptionsCode = {
  code: {
    mode: 'json' | 'css' | 'html' | 'javascript' | 'yaml';
  };
};
export interface Schema extends Record<string, any> {
  // Field type
  type?: SchemaTypes;
  // Field label
  title?: string | ReactNode;
  // Description in a help tooltip
  description?: string | ReactNode;
  // Input placeholder
  placeholder?: string;
  // Add button label when in a list of items or properties
  add?: string;
  // Remove button label when in a list of items or properties
  remove?: string;
  // Property key label
  propertyKey?: string;
  // Property value label
  propertyValue?: string;
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
  // @deprecated
  pattern?: string;
  // Validation errors messages
  // @deprecated
  errors?: Record<string, string>;
  validators?: Record<
    'required' | 'pattern' | 'min' | 'max' | 'tel' | 'email' | 'date',
    | {
        value?: string | number | boolean;
        message?: string;
      }
    | true
  >;
  // Custom widget
  'ui:widget'?: UIWidgets | FunctionComponent<FieldProps>;
  // Options for UI components
  'ui:options'?:
    | UiOptionsCommon
    | UIOptionsNumber
    | UiOptionsGrid
    | UiOptionsOneOf
    | UiOptionsArray
    | UiOptionsTextArea
    | UiOptionsUpload
    | UiOptionsSelect
    | UiOptionsTags
    | UiOptionsDate
    | UiOptionsAutocomplete
    | UiOptionsDynamicAutocomplete
    | UiOptionsHTML
    | UiOptionsSlider
    | Record<string, any>;
}

export interface FieldProps {
  schema: Schema;
  name: string;
  label?: string;
  className?: string;
}
