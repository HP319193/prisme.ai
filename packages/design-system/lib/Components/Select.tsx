import { Select as AntdSelect, SelectProps as AntdSelectProps } from 'antd';
import { WithLabel } from '../';
import { ReactNode } from 'react';

const { Option, OptGroup } = AntdSelect;

export type SelectOption = {
  value: string;
  label: string | ReactNode;
};

export type SelectGroup = {
  label: string | ReactNode;
  options: SelectOption[];
};

export const isSelectGroup = (
  i: SelectGroup | SelectOption
): i is SelectGroup => !!(i as SelectGroup).options;

export interface SelectProps extends AntdSelectProps {
  selectOptions: SelectOption[] | SelectGroup[];
  label?: string;
  overrideContainerClassName?: string;
}

const Select = ({
  selectOptions,
  label,
  overrideContainerClassName,
  ...otherProps
}: SelectProps) => (
  <WithLabel label={label} overrideClassName={overrideContainerClassName}>
    <AntdSelect
      {...otherProps}
      className={`flex ${otherProps.className || ''}`}
      dropdownMatchSelectWidth={false}
    >
      {selectOptions.map((item, index) => {
        if (isSelectGroup(item)) {
          return (
            <OptGroup key={index} label={item.label}>
              {item.options.map((item, k) => (
                <Option key={`${index}-${k}`} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </OptGroup>
          );
        }
        return (
          <Option key={index} value={item.value}>
            {item.label}
          </Option>
        );
      })}
    </AntdSelect>
  </WithLabel>
);

export default Select;
