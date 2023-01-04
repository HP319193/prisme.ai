import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { FieldArray as FFFieldArray } from 'react-final-form-arrays';
import Button from '../Button';
import { SchemaFormContext, useSchemaForm } from './context';
import Field from './Field';
import { FieldProps, Schema, UiOptionsArray } from './types';
import { getDefaultValue, getLabel } from './utils';
import FieldContainer from './FieldContainer';
import InfoBubble from './InfoBubble';

function isUiOptionsArray(
  uiOptions: Schema['ui:options']
): uiOptions is UiOptionsArray {
  return !!uiOptions && !!(uiOptions as UiOptionsArray).array;
}

export const FieldArray = (
  props: FieldProps & { locales: SchemaFormContext['locales'] }
) => {
  const { items = {} } = props.schema;
  const { 'ui:options': uiOptions } = props.schema;

  if (!items) return null;

  const asRow = isUiOptionsArray(uiOptions) && uiOptions.array === 'row';

  return (
    <FieldContainer {...props} className="pr-form-array">
      <label
        className="pr-form-array__label pr-form-label"
        htmlFor={props.name}
      >
        {props.label || props.schema.title || getLabel(props.name)}

        <InfoBubble
          className="pr-form-array__description"
          text={props.schema.description}
        />
      </label>
      <FFFieldArray name={props.name}>
        {({ fields }) => (
          <>
            <div
              className={`pr-form-array__item ${
                asRow ? 'pr-form-array__item--as-row' : ''
              }`}
            >
              {fields.map((field, index) => (
                <div
                  key={field}
                  className={`pr-form-array__item-field ${
                    asRow ? 'pr-form-array__item-field--as-row' : ''
                  }`}
                >
                  <Field schema={items} name={field} />
                  <Button
                    onClick={() => fields.remove(index)}
                    className="pr-form-array__item-field-remove"
                    disabled={props.schema.disabled}
                  >
                    <Tooltip
                      title={
                        items.remove || props.locales.removeItem || 'Remove'
                      }
                      placement="left"
                    >
                      <DeleteOutlined />
                    </Tooltip>
                  </Button>
                </div>
              ))}
            </div>
            <div className="pr-form-array__item-add">
              <Tooltip
                title={items.add || props.locales.addItem || 'Add item'}
                placement="right"
              >
                <Button
                  onClick={() => fields.push(getDefaultValue(items.type))}
                  className="pr-form-array__item-add-button"
                  disabled={props.schema.disabled}
                  id={props.name}
                >
                  <PlusOutlined />
                </Button>
              </Tooltip>
            </div>
          </>
        )}
      </FFFieldArray>
    </FieldContainer>
  );
};

const LinkedFieldArray = (props: FieldProps) => {
  const { locales = {} } = useSchemaForm();

  return <FieldArray {...props} locales={locales} />;
};

export default LinkedFieldArray;
