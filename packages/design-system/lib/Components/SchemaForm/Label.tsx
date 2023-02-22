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
  const { title } = schema;

  if (typeof title === 'object') {
    return (
      <label className={className} htmlFor={field.input.name}>
        {title}
      </label>
    );
  }

  const label = children || title || getLabel(field.input.name, title);
  if (!label) return null;

  if (typeof label === 'object') {
    return null;
  }

  return (
    <label
      className={className}
      htmlFor={field.input.name}
      dangerouslySetInnerHTML={{ __html: `${label}` }}
    />
  );
};

export default Label;
