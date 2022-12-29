import { Radio } from 'antd';
import { ReactNode } from 'react';
import { FieldInputProps, useField } from 'react-final-form';
import { isSelectGroup, SelectProps } from '../Select';
import Description from './Description';
import { useSelectOptions } from './FieldSelect';
import { FieldProps } from './types';
import { getLabel } from './utils';

const RadioGroup = ({
  onChange,
  label,
  options,
}: {
  label?: string | ReactNode;
  options: ReturnType<typeof useSelectOptions>;
  onChange: FieldInputProps<any, HTMLElement>['onChange'];
}) => {
  return (
    <div>
      <label className="flex mb-[0.625rem]">{label}</label>
      <Radio.Group onChange={onChange}>
        {options?.map((option) => {
          if (isSelectGroup(option)) {
            return (
              <RadioGroup
                options={option.options}
                label={option.label}
                onChange={onChange}
              />
            );
          }
          return (
            <Radio key={`${label}`} value={option.value}>
              {option.label}
            </Radio>
          );
        })}
      </Radio.Group>
    </div>
  );
};

export const FieldRadio = ({
  schema,
  label,
  name,
  options,
}: FieldProps & { options?: SelectProps['selectOptions'] }) => {
  const field = useField(name);
  const selectOptions = useSelectOptions(schema, options);
  if (!selectOptions) return null;

  return (
    <Description text={schema.description}>
      <RadioGroup
        label={label || schema.title || getLabel(name)}
        options={selectOptions}
        onChange={field.input.onChange}
      />
    </Description>
  );
};

export default FieldRadio;
