import { Select as AntdSelect, SelectProps as AntdSelectProps } from 'antd';
import { ReactNode } from 'react';

const { Option, OptGroup } = AntdSelect;

type SelectOption = {
  value: string;
  label: string | ReactNode;
};

type SelectGroup = {
  label: string | ReactNode;
  options: SelectOption[];
};

const isSelectGroup = (i: SelectGroup | SelectOption): i is SelectGroup =>
  !!(i as SelectGroup).options;

export interface SelectProps extends AntdSelectProps {
  selectOptions: SelectOption[] | SelectGroup[];
  label?: string;
}

const Select = ({ selectOptions, label, ...otherProps }: SelectProps) => {
  return (
    <div className={`relative pr-input ${label ? 'mt-5' : ''}`}>
      <AntdSelect
        {...otherProps}
        className={`flex grow ${otherProps.className || ''}`}
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
      <label className="pr-label-top duration-75 ease-in absolute bottom-[15px] origin-0 left-[11px] text-gray font-normal pointer-events-none">
        {label}
      </label>
    </div>
  );
};

export default Select;
