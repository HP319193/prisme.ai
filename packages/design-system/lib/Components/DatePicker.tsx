import {
  DatePicker as AntdDatePicker,
  DatePickerProps as AntdDatePickerProps,
} from 'antd';
import moment from 'moment';

export interface DatePickerProps {
  stringValue?: string;
  stringOnChange?: (value: string) => void;
}

const dateFormat = ['DD/MM/YYYY', ''];

const DatePicker = ({
  stringValue,
  stringOnChange,
  value,
  onChange,
  ...props
}: DatePickerProps & AntdDatePickerProps) => {
  const _value = stringValue ? moment(stringValue) : value;
  const _onChange = stringOnChange
    ? (_: any, dateString: string) => {
        const date = moment.utc(dateString, dateFormat).format();
        stringOnChange(date);
      }
    : onChange;

  return (
    <AntdDatePicker
      format={dateFormat}
      value={_value}
      onChange={_onChange}
      {...props}
    />
  );
};

export default DatePicker;
