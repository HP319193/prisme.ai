import {
  DatePicker as AntdDatePicker,
  DatePickerProps as AntdDatePickerProps,
} from 'antd';
import moment from 'moment';

export type DatePickerProps = {
  stringValue?: string;
  stringOnChange?: (value: string) => void;
  label?: string;
} & AntdDatePickerProps;

const dateFormat = ['DD/MM/YYYY', ''];

const DatePicker = ({
  stringValue,
  stringOnChange,
  value,
  onChange,
  className,
  placeholder,
  ...props
}: DatePickerProps) => {
  const _value = stringValue ? moment(stringValue) : value;

  return (
    <AntdDatePicker
      format={dateFormat}
      value={_value}
      onChange={onChange}
      className={`h-[2.5rem] basis-[2.5rem] flex flex-1 ${className}`}
      placeholder=""
      {...props}
    />
  );
};

export default DatePicker;
