import {
  DatePicker as AntdDatePicker,
  DatePickerProps as AntdDatePickerProps,
} from 'antd';
import moment from 'moment';
import FloatingLabel from './Internal/FloatingLabel';

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
  label,
  placeholder,
  ...props
}: DatePickerProps) => {
  const _value = stringValue ? moment(stringValue) : value;

  return (
    <FloatingLabel
      label={label}
      component={
        <AntdDatePicker
          format={dateFormat}
          value={_value}
          onChange={onChange}
          className={`h-[50px] basis-[50px] flex flex-1 ${className}`}
          placeholder=""
          {...props}
        />
      }
      raisedPlaceholder={!!(placeholder || _value)}
      className="flex-1"
    />
  );
};

export default DatePicker;
