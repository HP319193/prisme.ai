import {
  DatePicker as AntdDatePicker,
  DatePickerProps as AntdDatePickerProps,
} from 'antd';
import moment from 'moment';
import { WithLabel } from '../';

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
    <WithLabel label={label} className="flex-1">
      <AntdDatePicker
        format={dateFormat}
        value={_value}
        onChange={onChange}
        className={`h-[2.5rem] basis-[2.5rem] flex flex-1 ${className}`}
        placeholder=""
        {...props}
      />
    </WithLabel>
  );
};

export default DatePicker;
