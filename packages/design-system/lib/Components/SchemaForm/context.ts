import { UiOptionsSelect, Schema } from '@prisme.ai/design-system';
import { createContext, FC, ReactElement, useContext } from 'react';
import { SelectProps } from '../Select';
import { FieldProps, UiOptionsAutocomplete } from './types';

type FieldComponent<T = any> = (props: FieldProps & T) => ReactElement | null;
type InputComponent = (props: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
}) => ReactElement;

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
    FreeAdditionalProperties?: FieldComponent;
    ManagedAdditionalProperties?: FieldComponent;
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

export const FieldContainer: FC<FieldProps> = ({ children }) =>
  children as ReactElement;
export const context = createContext<SchemaFormContext>({
  locales: {},
  components: {
    FieldContainer,
  },
  utils: {
    extractSelectOptions: () => [],
    extractAutocompleteOptions: () => [],
    uploadFile: async () => '',
  },
});

export const useSchemaForm = () => useContext(context);
