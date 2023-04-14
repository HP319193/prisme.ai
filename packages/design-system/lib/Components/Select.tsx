import { Select as AntdSelect, SelectProps as AntdSelectProps } from 'antd';
import { ReactNode } from 'react';

const { Option, OptGroup } = AntdSelect;

export type SelectOption = {
  value: string;
  label: string | ReactNode;
};

export type TagsOption = {
  value: string;
  label: string | ReactNode;
  color?: string;
};

export type SelectGroup = {
  label: string | ReactNode;
  options: SelectOption[];
};

export const isSelectGroup = (
  i: SelectGroup | SelectOption
): i is SelectGroup => !!(i as SelectGroup).options;

export interface SelectProps extends AntdSelectProps {
  selectOptions: SelectOption[] | SelectGroup[] | TagsOption[];
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
    onInputKeyDown={(e) => {
      // Ant hijack the Enter key to open the menu. We don't like thath
      // This lines makes enterKey submit the form if the menu is closed.
      if (e.key !== 'Enter') return;
      const input = e.target as HTMLInputElement;
      const isOpen = input.closest('.ant-select-open');
      if (isOpen) return;
      e.stopPropagation();
      const { form } = input;
      const button = form?.querySelector('[type=submit]') as HTMLButtonElement;
      button?.click();
    }}
  />
);

export default Select;
