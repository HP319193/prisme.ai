import { Switch } from 'antd';
import { useField } from 'react-final-form';
import Description from './Description';
import { FieldProps } from './types';
import { getLabel } from './utils';

export const FieldBoolean = ({ schema, name, label }: FieldProps) => {
  const field = useField(name);

  return (
    <div className="relative flex mt-5 flex-1">
      <Description text={schema.description}>
        <div className="ant-input flex items-center flex-1 rounded h-[50px] basis-[50px] invalid:border-red-500 invalid:text-red-500">
          <label className="cursor-pointer">
            <Switch {...field.input} checked={field.input.value} />
            <span className="text-[10px] text-gray ml-2">
              {label || schema.title || getLabel(name)}
            </span>
          </label>
        </div>
      </Description>
    </div>
  );
};

export default FieldBoolean;
