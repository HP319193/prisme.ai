import { UiOptionsSelect, Schema } from '@prisme.ai/design-system';
import {
  createContext,
  Dispatch,
  FC,
  ReactElement,
  SetStateAction,
  useContext,
} from 'react';
import { FieldRenderProps } from 'react-final-form';
import { SelectProps, TagsOption } from '../Select';
import { Field } from './Field';
import { DefaultFieldContainer } from './FieldContainer';
import {
  FieldProps,
  UiOptionsAutocomplete,
  UiOptionsCode,
  UiOptionsHTML,
  UiOptionsUpload,
} from './types';

export type FieldComponent<T = {}> = (
  props: FieldProps & { field?: FieldRenderProps<any, HTMLElement, any> } & T
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
    uploadingLabel?: string;
    uploadRemove?: string;
    freeAdditionalPropertiesLabel?: string;
  };
  components: {
    Field?: typeof Field;
    FieldContainer: FC<FieldProps>;
    FieldLocalizedText?: FieldComponent;
    FieldText?: FieldComponent;
    FieldBoolean?: FieldComponent;
    FieldLocalizedBoolean?: FieldComponent;
    FieldObject?: FieldComponent;
    FieldArray?: FieldComponent;
    FieldArrayUpload?: FieldComponent<{ options?: UiOptionsUpload }>;
    FieldAny?: FieldComponent;
    FieldFreeAdditionalProperties?: FieldComponent;
    FieldTags?: FieldComponent<{ options?: TagsOption }>;
    FieldSelect?: FieldComponent<{ options?: SelectProps['selectOptions'] }>;
    FieldRadio?: FieldComponent<{ options?: SelectProps['selectOptions'] }>;
    FieldDate?: FieldComponent;
    FieldCode?: FieldComponent<{ options?: UiOptionsCode }>;
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
      base64File: string,
      opts?: {
        expiresAfter?: number;
        public?: boolean;
        shareToken?: boolean;
      }
    ) => Promise<
      string | { value: string; preview: string | ReactElement; label?: string }
    >;
  } & Record<string, any>;
  state: {
    loading?: boolean;
  };
  setState: Dispatch<SetStateAction<{}>>;
}

export const FieldContainer = DefaultFieldContainer;
export const context = createContext<SchemaFormContext>({
  locales: {},
  components: {
    FieldContainer: DefaultFieldContainer,
    UiWidgets: {},
  },
  utils: {
    extractSelectOptions: () => [],
    extractAutocompleteOptions: () => [],
    uploadFile: async () => '',
  },
  state: {},
  setState: () => null,
});

export const useSchemaForm = () => useContext(context);
