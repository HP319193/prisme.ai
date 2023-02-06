import { Select as AntdSelect, SelectProps as AntdSelectProps } from 'antd';
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
  overrideContainerClassName?: string;
}

const Select = ({
  selectOptions,
  overrideContainerClassName,
  value,
  ...otherProps
}: SelectProps) => (
  <AntdSelect
    {...otherProps}
    className={`flex ${otherProps.className || ''}`}
    dropdownMatchSelectWidth={false}
    options={selectOptions}
    value={value || value === 0 ? value : undefined}
  />
);

export default Select;
