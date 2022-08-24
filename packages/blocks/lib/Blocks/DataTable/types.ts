export const types = ['string', 'number', 'boolean', 'date', 'tags'] as const;

export type DataType = typeof types[number];

export interface Action {
  label: string;
  event?: string;
  payload?: any;
  url?: string;
}

export type FormatDate = Intl.DateTimeFormatOptions;
export type FormatNumber = Intl.NumberFormatOptions;

export interface ColumnDefinition {
  label?: string;
  key?: string;
  type?: DataType;
  format?: FormatDate | FormatNumber;
  actions?: Action[];
  onEdit?: string;
}
