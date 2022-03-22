import { Input as AntdInput } from 'antd';
import { TextAreaProps as AntdTextareaProps } from 'antd/lib/input/TextArea';
import { forwardRef } from 'react';

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
      <div className={`flex-1 relative pr-input ${label ? 'mt-5' : ''}`}>
        <AntdTextarea
          ref={ref}
          placeholder={placeholder}
          className={`${className} rounded h-[50px] basis-[50px]`}
          {...otherProps}
        />
        {placeholder || otherProps.value ? (
          <label className="duration-75 ease-in absolute top-[15px] origin-0 left-[11px] text-gray font-normal pointer-events-none pr-label-top">
            {label}
          </label>
        ) : (
          <label className="duration-75 ease-in absolute top-[15px] origin-0 left-[11px] text-gray font-normal pointer-events-none">
            {label}
          </label>
        )}
      </div>
    );
  }
);
export default TextArea;
