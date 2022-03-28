import {
  DatePicker as AntdDatePicker,
  DatePickerProps as AntdDatePickerProps,
} from 'antd';
import moment from 'moment';
import FloatingLabel from './Internal/FloatingLabel';

export interface DatePickerProps {
  stringValue?: string;
  stringOnChange?: (value: string) => void;
  label?: string;
}

const dateFormat = ['DD/MM/YYYY', ''];

const DatePicker = ({
  stringValue,
  stringOnChange,
  value,
  onChange,
  className,
  label,
  placeholder,
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
    <FloatingLabel
      label={label}
      component={
        <AntdDatePicker
          format={dateFormat}
          value={_value}
          onChange={_onChange}
          className={`h-[50px] basis-[50px] ${className}`}
          placeholder=""
          {...props}
        />
      }
      raisedPlaceholder={!!(placeholder || _value)}
    />
  );
};

export default DatePicker;
