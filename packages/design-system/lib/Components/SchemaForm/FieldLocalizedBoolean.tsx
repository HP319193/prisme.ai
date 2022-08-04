import { Switch } from 'antd';
import { useField } from 'react-final-form';
import { LocalizedInput } from '../..';
import Description from './Description';
import { FieldProps } from './types';
import { getLabel } from './utils';

const LocalizedSwitch = ({
  value,
  onChange,
}: {
  value: boolean;
  onChange: any;
}) => {
  return (
    <Switch
      checked={value}
      onChange={(checked) => onChange({ target: { value: checked } })}
    />
  );
};

export const FieldLocalizedBoolean = (props: FieldProps) => {
  const field = useField(props.name);

  return (
    <div className="relative flex mt-5 flex-1">
      <Description text={props.schema.description}>
        <div className="ant-input flex flex-row items-center flex-1 !rounded-[0.3rem] h-[50px] basis-[50px] invalid:border-red-500 invalid:text-red-500">
          <label className="flex cursor-pointer">
            <LocalizedInput
              {...field.input}
              Input={LocalizedSwitch}
              InputProps={props}
              className="!static"
            />
            <span className="text-[10px] text-gray ml-2">
              {props.label || props.schema.title || getLabel(props.name)}
            </span>
          </label>
        </div>
      </Description>
    </div>
  );
};

export default FieldLocalizedBoolean;
