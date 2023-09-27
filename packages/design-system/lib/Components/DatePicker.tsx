import {
  DatePicker as AntdDatePicker,
  DatePickerProps as AntdDatePickerProps,
} from 'antd';
import moment from 'moment';

export type DatePickerProps = AntdDatePickerProps & {
  stringValue?: string;
  stringOnChange?: (value: string) => void;
  label?: string;
  format?: string;
};

const DatePicker = ({
  stringValue,
  stringOnChange,
  value,
  onChange,
  className,
  format = 'DD/MM/YYYY',
  ...props
}: DatePickerProps) => {
  const _value = stringValue ? moment(stringValue) : value;
  const [timeFormat] = format.match(/HH(:mm)?(:ss)?/) || [];

  return (
    <AntdDatePicker
      format={format}
      value={_value}
      onChange={onChange}
      className={`h-[2.5rem] basis-[2.5rem] flex flex-1 ${className}`}
      //@ts-ignore
      showTime={timeFormat ? { format: timeFormat } : undefined}
      {...props}
    />
  );
};

export default DatePicker;
