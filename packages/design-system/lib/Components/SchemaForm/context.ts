import { createContext, FC, ReactElement, useContext } from 'react';
import { SelectProps } from '../Select';
import { FieldProps } from './types';

type FieldComponent<T = any> = (props: FieldProps & T) => ReactElement;
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
    FieldDate?: FieldComponent;
    JSONEditor?: InputComponent;
  };
}

export const FieldContainer: FC<FieldProps> = ({ children }) =>
  children as ReactElement;
export const context = createContext<SchemaFormContext>({
  locales: {},
  components: {
    FieldContainer,
  },
});

export const useSchemaForm = () => useContext(context);
