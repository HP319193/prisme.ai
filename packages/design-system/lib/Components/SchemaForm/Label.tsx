import { FieldRenderProps } from 'react-final-form';
import { Schema } from './types';
import { getLabel } from './utils';

interface LabelProps {
  className: string;
  field: FieldRenderProps<any, HTMLElement, any>;
  schema: Schema;
  children?: string;
}

export const Label = ({ className, children, field, schema }: LabelProps) => {
  const label = children || schema.title || getLabel(field.input.name);
  if (!label) return null;
  return (
    <label className={className} htmlFor={field.input.name}>
      {label}
    </label>
  );
};

export default Label;
