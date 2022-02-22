import { Select as AntdSelect, SelectProps as AntdSelectProps } from 'antd';

const { Option } = AntdSelect;

type SelectOption = {
  value: string;
  label: string;
};

export interface SelectProps extends AntdSelectProps {
  selectOptions: SelectOption[];
  label?: string;
}

const Select = ({ selectOptions, label, ...otherProps }: SelectProps) => (
  <div className={`relative pr-input ${label ? 'mt-5' : ''}`}>
    <AntdSelect
      {...otherProps}
      className={`flex grow ${otherProps.className || ''}`}
    >
      {selectOptions.map(({ value, label }) => (
        <Option value={value}>{label}</Option>
      ))}
    </AntdSelect>
    <label className="pr-label-top duration-75 ease-in absolute bottom-[15px] origin-0 left-[11px] text-gray font-normal pointer-events-none">
      {label}
    </label>
  </div>
);

export default Select;
