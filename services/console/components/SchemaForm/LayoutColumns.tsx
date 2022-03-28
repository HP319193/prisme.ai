import { Field } from './Field';
import Layout from './Layout';
import { Schema } from './types';

interface LayoutColumnsProps {
  fields: (Schema & { field: string })[];
  required: string[];
  options?: any;
}

const FieldByName = ({
  name,
  fields,
  required,
}: LayoutColumnsProps & { name: string }) => {
  const field = fields.find(({ field }) => field === name)!;
  return (
    <div className="flex flex-1">
      <Field {...field} required={required.includes(field.field)} />
    </div>
  );
};

export const LayoutColumns = ({
  options,
  fields,
  required,
}: LayoutColumnsProps) => {
  const lines: (string[] | string)[][] = options.lines;

  return (
    <div className="flex flex-1 flex-col">
      {lines.map((columns, lindex) => (
        <div key={lindex} className="flex flex-1 flex-row">
          {columns.map((column, cindex) =>
            Array.isArray(column) ? (
              <div
                key={cindex}
                className={`flex flex-1 flex-col ${
                  cindex === columns.length - 1 ? '' : 'mr-4'
                }`}
              >
                {column.map((name, index) => (
                  <div key={index} className="flex">
                    <FieldByName
                      name={name}
                      fields={fields}
                      required={required}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <FieldByName name={column} fields={fields} required={required} />
            )
          )}
        </div>
      ))}
    </div>
  );
};

export default LayoutColumns;
