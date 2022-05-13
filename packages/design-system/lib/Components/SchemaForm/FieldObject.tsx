import { useSchemaForm } from './context';
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

export const FieldObject = (props: FieldProps) => {
  const { additionalProperties, 'ui:options': uiOptions } = props.schema;
  const { components } = useSchemaForm();

  const grid = isUiOptionsGrid(uiOptions) && uiOptions.grid;
  const noBorder =
    props.name.split(/\./).length === 1 ||
    !props.schema.properties ||
    Object.keys(props.schema.properties).length === 0;

  return (
    <div
      className={`space-y-5 ${
        noBorder ? '' : 'm-2 p-2 pl-3 border-[1px] border-gray-200 rounded'
      }`}
    >
      <Description text={props.schema.description}>
        <components.FieldContainer {...props}>
          <label className="text-[10px] text-gray max-w-[80%]">
            {props.label || props.schema.title || getLabel(props.name)}
          </label>
          {grid && <LayoutGrid grid={grid} {...props} />}
          {!grid && <LayoutBasic {...props} />}
          {additionalProperties && <FieldAdditionalProperties {...props} />}
        </components.FieldContainer>
      </Description>
    </div>
  );
};

export default FieldObject;
