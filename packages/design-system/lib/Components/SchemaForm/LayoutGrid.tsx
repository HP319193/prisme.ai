import Field from './Field';
import { FieldProps, UiOptionsGrid } from './types';

interface LayoutGridProps extends FieldProps {
  grid: UiOptionsGrid['grid'];
}

export const LayoutGrid = ({ grid, name, schema }: LayoutGridProps) => {
  const { properties } = schema;

  if (!properties || !grid) return null;

  return (
    <>
      {grid.map((lines, lindex) => (
        <div key={`${lindex}`} className="flex flex-col space-y-5">
          {lines.map((rows, rindex) => (
            <div key={`${rindex}`} className="flex flex-row">
              {rows.map(
                (field, index) =>
                  !!properties[field] && (
                    <div
                      key={`${index}`}
                      className={`flex flex-1 ${
                        index === rows.length - 1 ? '' : 'mr-2'
                      }`}
                    >
                      <Field
                        key={field}
                        name={`${name}.${field}`}
                        schema={properties[field]}
                      />
                    </div>
                  )
              )}
            </div>
          ))}
        </div>
      ))}
    </>
  );
};
export default LayoutGrid;
