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

export interface ColumnDefinition {
  label?: Prismeai.LocalizedText;
  key?: string;
  type?: DataType;
  format?: FormatDate | FormatNumber;
  actions?: Action[];
  onEdit?: string;
  validators?: Record<
    'required' | 'pattern' | 'min' | 'max' | 'tel' | 'email' | 'date',
    | {
        value?: string | number | boolean;
        message?: string;
      }
    | true
  >;
}
