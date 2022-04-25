import Description from './Description';
import FieldAdditionalProperties from './FieldAdditionalProperties';
import LayoutBasic from './LayoutBasic';
import LayoutGrid from './LayoutGrid';
import { FieldProps, Schema, UiOptionsGrid } from './types';
import { getLabel } from './utils';

function isUiOptionsGrid(
  uiOptions: Schema['ui:options']
): uiOptions is UiOptionsGrid {
  return !!uiOptions && !!(uiOptions as UiOptionsGrid).grid;
}

export const FieldObject = ({ schema, name, label }: FieldProps) => {
  const { additionalProperties, 'ui:options': uiOptions } = schema;

  const grid = isUiOptionsGrid(uiOptions) && uiOptions.grid;
  const noBorder =
    name.split(/\./).length === 1 ||
    !schema.properties ||
    Object.keys(schema.properties).length === 0;

  return (
    <div
      className={
        noBorder ? '' : 'm-2 p-2 pl-3 border-[1px] border-gray-200 rounded'
      }
    >
      <Description text={schema.description}>
        <label className="text-[10px] text-gray">
          {label || schema.title || getLabel(name)}
        </label>
        {grid && (
          <LayoutGrid grid={grid} schema={schema} name={name} label={label} />
        )}
        {!grid && <LayoutBasic schema={schema} name={name} label={label} />}
        {additionalProperties && (
          <FieldAdditionalProperties schema={schema} name={name} />
        )}
      </Description>
    </div>
  );
};

export default FieldObject;
