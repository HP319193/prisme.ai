import { Input as AntdInput } from 'antd';
import { TextAreaProps as AntdTextareaProps } from 'antd/lib/input/TextArea';
import { forwardRef } from 'react';
import { WithLabel } from './Label';

const { TextArea: AntdTextarea } = AntdInput;

export interface TextAreaProps extends AntdTextareaProps {
  placeholder?: string;
  label?: string;
  className?: string;
}

const TextArea = forwardRef(
  (
    { placeholder, label, className, ...otherProps }: TextAreaProps,
    ref: any
  ) => {
    return (
      <WithLabel label={label}>
        <AntdTextarea
          ref={ref}
          placeholder={placeholder}
          className={`${className} !rounded-[0.3rem] h-[50px] basis-[50px]`}
          {...otherProps}
        />
      </WithLabel>
    );
  }
);
export default TextArea;
