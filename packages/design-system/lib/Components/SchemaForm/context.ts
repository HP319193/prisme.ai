import { createContext, ReactElement, useContext } from 'react';
import { FieldProps } from './types';

type FieldComponent = (props: FieldProps) => ReactElement;
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
    FieldLocalizedText?: FieldComponent;
    FieldText?: FieldComponent;
    FieldBoolean?: FieldComponent;
    FieldLocalizedBoolean?: FieldComponent;
    FieldObject?: FieldComponent;
    FieldArray?: FieldComponent;
    FieldAny?: FieldComponent;
    FieldFreeAdditionalProperties?: FieldComponent;
    FieldSelect?: FieldComponent;
    FieldDate?: FieldComponent;
    JSONEditor?: InputComponent;
  };
}

export const context = createContext<SchemaFormContext>({
  locales: {},
  components: {},
});

export const useSchemaForm = () => useContext(context);
