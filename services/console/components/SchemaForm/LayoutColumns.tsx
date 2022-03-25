import { Field } from './Field';
import { Schema } from './types';

interface LayoutColumnsProps {
  fields: (Schema & { field: string })[];
  required: string[];
  options?: any;
}

export const LayoutColumns = ({
  options,
  fields,
  required,
}: LayoutColumnsProps) => {
  const columns: string[][] = options.columns;

  return (
    <div className="flex flex-1 flex-row">
      {columns.map((column, index) => (
        <div
          key={index}
          className={`flex flex-1 flex-col ${
            index === columns.length - 1 ? '' : 'mr-2'
          }`}
        >
          {column.map((name, index) => {
            const field = fields.find(({ field }) => field === name)!;
            return (
              <div key={index} className="flex">
                <Field {...field} required={required.includes(field.field)} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default LayoutColumns;
