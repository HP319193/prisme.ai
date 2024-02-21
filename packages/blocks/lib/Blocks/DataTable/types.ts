import { Schema } from '@prisme.ai/design-system';

export const types = ['string', 'number', 'boolean', 'date', 'tags'] as const;

export type DataType = typeof types[number];

export interface Action {
  label: Prismeai.LocalizedText;
  action: {
    type: 'event' | 'url';
    value?: string;
    payload?: any;
    popup?: boolean;
  };
}

export type FormatDate = Intl.DateTimeFormatOptions;
export type FormatNumber = Intl.NumberFormatOptions;

export type OnEdit = {
  event: string;
  payload?: Record<string, any>;
};

export interface ColumnDefinition {
  label?: Prismeai.LocalizedText;
  key?: string;
  type?: DataType;
  format?: FormatDate | FormatNumber;
  actions?: Action[];
  onEdit?: string | OnEdit;
  validators?: Record<
    'required' | 'pattern' | 'min' | 'max' | 'tel' | 'email' | 'date',
    | {
        value?: string | number | boolean;
        message?: string;
      }
    | true
  >;
  schemaForm?: Schema;
}
