import { Field } from './Field';
import LayoutColumns from './LayoutColumns';
import { Schema } from './types';

interface LayoutProps {
  fields: (Schema & { field: string })[];
  required: string[];
  options?: any;
}

export const Layout = ({ fields, required, options = {} }: LayoutProps) => {
  switch (options.layout) {
    case 'columns':
      return (
        <LayoutColumns fields={fields} required={required} options={options} />
      );
    default:
      return (
        <>
          {fields.map((field) => (
            <div key={field.field}>
              <Field {...field} required={required.includes(field.field)} />
            </div>
          ))}
        </>
      );
  }
};

export default Layout;
