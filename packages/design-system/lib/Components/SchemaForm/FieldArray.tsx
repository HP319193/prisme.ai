import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
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

export const FieldArray = (props: FieldProps) => {
  const { items = {} } = props.schema;
  const { locales = {}, components } = useSchemaForm();
  const { 'ui:options': uiOptions } = props.schema;

  if (!items) return null;

  const asRow = isUiOptionsArray(uiOptions) && uiOptions.array === 'row';
  console.log('schema', props.schema);
  console.log('row', asRow);

  return (
    <div className="p-2">
      <Description text={props.schema.description}>
        <components.FieldContainer {...props}>
          <label className="flex mb-5">
            {props.label || props.schema.title || getLabel(props.name)}
          </label>
          <FFFieldArray name={props.name}>
            {({ fields }) => (
              <>
                <div
                  className={
                    asRow ? 'flex flex-row flex-wrap' : 'ml-2 flex-1 space-y-5'
                  }
                >
                  {fields.map((field, index) => (
                    <div
                      key={field}
                      className={`flex flex-1 relative ${
                        asRow ? 'min-w-[30%]' : ''
                      }`}
                    >
                      <div
                        className={asRow ? 'min-w-full' : 'flex-1 space-y-5'}
                      >
                        <Field schema={items} name={field} />
                        <Button
                          onClick={() => fields.remove(index)}
                          className="!absolute top-[1.7rem] right-1 text-gray hover:text-orange-500"
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
                <div className="flex w-full justify-end mt-5">
                  <Button
                    onClick={() => fields.push(getDefaultValue(items.type))}
                    className="flex items-center"
                  >
                    <span className="underline">
                      {locales.addItem || 'Add item'}
                    </span>
                    <PlusCircleOutlined />
                  </Button>
                </div>
              </>
            )}
          </FFFieldArray>
        </components.FieldContainer>
      </Description>
    </div>
  );
};

export default FieldArray;
