import { UiOptionsSelect, Schema } from '@prisme.ai/design-system';
import { createContext, FC, ReactElement, useContext } from 'react';
import { SelectProps } from '../Select';
import { DefaultFieldContainer } from './FieldContainer';
import { FieldProps, UiOptionsAutocomplete, UiOptionsHTML } from './types';

export type FieldComponent<T = any> = (
  props: FieldProps & T
) => ReactElement | null;
export type InputComponent<T = {}> = (
  props: T & {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  }
) => ReactElement;

export interface SchemaFormContext {
  locales: {
    submit?: string;
    addProperty?: string;
    removeProperty?: string;
    propertyKey?: string;
    propertyValue?: string;
    addItem?: string;
    removeItem?: string;
    oneOfOption?: string;
    uploadLabel?: string;
    uploadRemove?: string;
    freeAdditionalPropertiesLabel?: string;
  };
  components: {
    FieldContainer: FC<FieldProps>;
    FieldLocalizedText?: FieldComponent;
    FieldText?: FieldComponent;
    FieldBoolean?: FieldComponent;
    FieldLocalizedBoolean?: FieldComponent;
    FieldObject?: FieldComponent;
    FieldArray?: FieldComponent;
    FieldAny?: FieldComponent;
    FieldFreeAdditionalProperties?: FieldComponent;
    FieldSelect?: FieldComponent<{ options?: SelectProps['selectOptions'] }>;
    FieldRadio?: FieldComponent<{ options?: SelectProps['selectOptions'] }>;
    FieldDate?: FieldComponent;
    JSONEditor?: InputComponent;
    HTMLEditor?: InputComponent<{ options?: UiOptionsHTML }>;
    FreeAdditionalProperties?: FieldComponent;
    ManagedAdditionalProperties?: FieldComponent;
    UiWidgets: Record<string, FieldComponent>;
  };
  utils: {
    extractSelectOptions: (
      schema: Schema
    ) => UiOptionsSelect['select']['options'] | null;
    extractAutocompleteOptions: (
      schema: Schema
    ) => UiOptionsAutocomplete['autocomplete']['options'] | null;
    uploadFile: (
      base64File: string
    ) => Promise<
      string | { value: string; preview: string | ReactElement; label?: string }
    >;
  };
}

export const FieldContainer = DefaultFieldContainer;
export const context = createContext<SchemaFormContext>({
  locales: {},
  components: {
    FieldContainer: DefaultFieldContainer,
  },
  utils: {
    extractSelectOptions: () => [],
    extractAutocompleteOptions: () => [],
    uploadFile: async () => '',
  },
});

export const useSchemaForm = () => useContext(context);
