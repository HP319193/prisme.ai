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
        <div
          key={`${lindex}`}
          className="pr-form-object__property pr-form-object__property--grid"
        >
          {lines.map((rows, rindex) => (
            <div
              key={`${rindex}`}
              className="pr-form-object__property--grid-line"
            >
              {rows.map(
                (field, index) =>
                  !!properties[field] && (
                    <div
                      key={`${index}`}
                      className="pr-form-object__property--grid-row"
                    >
                      <Field
                        key={field}
                        name={`${name}.${field}`}
                        schema={{
                          disabled: schema.disabled,
                          ...properties[field],
                        }}
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
