import { useEffect, useMemo, useState } from 'react';
import { useField } from 'react-final-form';
import FieldAdditionalProperties from './FieldAdditionalProperties';
import LayoutBasic from './LayoutBasic';
import LayoutGrid from './LayoutGrid';
import { FieldProps, Schema, UiOptionsGrid } from './types';
import FieldContainer from './FieldContainer';
import InfoBubble from './InfoBubble';
import StretchContent from '../StretchContent';
import { getLabel } from './utils';
import { RightOutlined } from '@ant-design/icons';

function isUiOptionsGrid(
  uiOptions: Schema['ui:options']
): uiOptions is UiOptionsGrid {
  return !!uiOptions && !!(uiOptions as UiOptionsGrid).grid;
}

export const FieldObject = (props: FieldProps) => {
  const { additionalProperties, 'ui:options': uiOptions } = props.schema;
  const field = useField(props.name, { defaultValue: props.schema.default });
  const [visible, setVisible] = useState(true);

  const grid = isUiOptionsGrid(uiOptions) && uiOptions.grid;

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
    if (props.schema.additionalProperties) return;
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

  const label = props.label || props.schema.title || getLabel(field.input.name);
  return (
    <FieldContainer {...props} className="pr-form-object">
      {label && (
        <button
          type="button"
          className={`pr-form-object__label pr-form-label ${
            visible ? 'pr-form-object__label--visible' : ''
          }`}
          onClick={() => setVisible(!visible)}
        >
          <RightOutlined className="pr-form-object__label-icon" />
          <span>{label}</span>

          <InfoBubble
            className="pr-form-object__description"
            text={props.schema.description}
          />
        </button>
      )}
      <StretchContent visible={!label || visible}>
        <div className="pr-form-object__properties">
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
        </div>
      </StretchContent>
    </FieldContainer>
  );
};

export default FieldObject;
