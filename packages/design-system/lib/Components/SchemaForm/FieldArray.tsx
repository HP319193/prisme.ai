import { DeleteOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { FieldArray as FFFieldArray } from 'react-final-form-arrays';
import Button from '../Button';
import { useSchemaForm } from './context';
import Description from './Description';
import Field from './Field';
import { FieldProps, Schema, UiOptionsArray } from './types';
import { getDefaultValue, getLabel } from './utils';

function isUiOptionsArray(
  uiOptions: Schema['ui:options']
): uiOptions is UiOptionsArray {
  return !!uiOptions && !!(uiOptions as UiOptionsArray).array;
}

export const FieldArray = ({ schema, name, label }: FieldProps) => {
  const { items = {} } = schema;
  const { locales = {} } = useSchemaForm();
  const { 'ui:options': uiOptions } = schema;

  if (!items) return null;

  const asRow = isUiOptionsArray(uiOptions) && uiOptions.array === 'row';

  return (
    <div className="m-2 p-2 border-l-[1px] rounded border-gray-200">
      <Description text={schema.description}>
        <label className="text-[10px] text-gray">
          {label || schema.title || getLabel(name)}
        </label>
        <FFFieldArray name={name}>
          {({ fields }) => (
            <div>
              <div className={asRow ? 'flex flex-row flex-wrap' : ''}>
                {fields.map((field, index) => (
                  <div
                    key={field}
                    className={`relative ${asRow ? 'min-w-[30%]' : ''}`}
                  >
                    <div className={asRow ? 'min-w-full' : ''}>
                      <Field schema={items} name={field} />
                      <Button
                        onClick={() => fields.remove(index)}
                        className="!absolute top-2 right-1"
                      >
                        <Tooltip
                          title={locales.removeItem || 'Remove'}
                          placement="left"
                        >
                          <DeleteOutlined />
                        </Tooltip>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => fields.push(getDefaultValue(items.type))}>
                {locales.addItem || 'Add item'}
              </Button>
            </div>
          )}
        </FFFieldArray>
      </Description>
    </div>
  );
};

export default FieldArray;
