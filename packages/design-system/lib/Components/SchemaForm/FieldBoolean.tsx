import { Switch } from 'antd';
import { useField } from 'react-final-form';
import { useSchemaForm } from './context';
import Description from './Description';
import { FieldProps } from './types';
import { getLabel } from './utils';

export const FieldBoolean = (props: FieldProps) => {
  const field = useField(props.name);
  const { components } = useSchemaForm();

  return (
    <div className="relative flex mt-5 flex-1">
      <Description text={props.schema.description}>
        <components.FieldContainer {...props}>
          <div className="flex items-center flex-1 !rounded-[0.3rem] h-[50px] basis-[50px] invalid:border-red-500 invalid:text-red-500">
            <label className="flex cursor-pointer">
              <Switch {...field.input} checked={field.input.value} />
              <span
                className="ml-2"
                dangerouslySetInnerHTML={{
                  __html:
                    props.label || props.schema.title || getLabel(props.name),
                }}
              />
            </label>
          </div>
        </components.FieldContainer>
      </Description>
    </div>
  );
};

export default FieldBoolean;
