import { useEffect, useMemo } from 'react';
import { useField } from 'react-final-form';
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
  const field = useField(props.name, { defaultValue: props.schema.default });

  const grid = isUiOptionsGrid(uiOptions) && uiOptions.grid;
  const noBorder =
    props.name.split(/\./).length === 1 ||
    !props.schema.properties ||
    Object.keys(props.schema.properties).length === 0;

  const schemaWithPropertiesWithOneOf = useMemo(() => {
    const { properties } = props.schema;
    if (!properties) return props.schema;
    const keys = Object.keys(properties);
    if (!keys.some((key) => properties[key].oneOf && !properties[key].type))
      return props.schema;

    const newProperties = keys.reduce((prev, key) => {
      const oneOf = (properties[key].oneOf || []).find(
        ({ type, properties, value }) =>
          !type && properties && value === field.input.value[key]
      );

      if (oneOf) {
        // Merge properties
        return {
          ...prev,
          [key]: properties[key],
          ...oneOf.properties,
        };
      }
      return {
        ...prev,
        [key]: properties[key],
      };
    }, {});
    return {
      ...props.schema,
      properties: newProperties,
    };
  }, [props.schema, field.input.value]);

  useEffect(() => {
    const keys = Object.keys(schemaWithPropertiesWithOneOf.properties || {});
    const valueKeys = Object.keys(field.input.value);
    const hasTooMuchKeys = valueKeys.some((key) => !keys.includes(key));
    if (!hasTooMuchKeys) return;

    const cleanedValue = Object.keys(
      schemaWithPropertiesWithOneOf.properties || {}
    ).reduce(
      (prev, key) => ({
        ...prev,
        [key]: field.input.value[key],
      }),
      {}
    );

    field.input.onChange(cleanedValue);
  }, [field.input.value, schemaWithPropertiesWithOneOf]);

  return (
    <Description
      text={props.schema.description}
      className={`space-y-5 ${
        noBorder
          ? ''
          : 'p-2 pl-3 border-[1px] border-gray-200 !rounded-[0.3rem]'
      }`}
    >
      <components.FieldContainer {...props}>
        <label className="flex font-semibold max-w-[80%]">
          {props.label || props.schema.title || getLabel(props.name)}
        </label>
        {grid && (
          <LayoutGrid
            grid={grid}
            {...props}
            schema={schemaWithPropertiesWithOneOf}
          />
        )}
        {!grid && (
          <LayoutBasic {...props} schema={schemaWithPropertiesWithOneOf} />
        )}
        {additionalProperties && (
          <FieldAdditionalProperties
            {...props}
            schema={schemaWithPropertiesWithOneOf}
          />
        )}
      </components.FieldContainer>
    </Description>
  );
};

export default FieldObject;
