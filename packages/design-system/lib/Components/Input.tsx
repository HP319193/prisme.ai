import { Input as AntdInput, InputProps as AntdInputProps } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { forwardRef } from 'react';

const { Password: AntdInputPassword } = AntdInput;

export interface InputProps extends AntdInputProps {
  placeholder?: string;
  label?: string;
  inputType?: AntdInputProps['type'];
  className?: string;
  containerClassName?: string;
  pattern?: string;
}

const Input = forwardRef(
  (
    {
      placeholder,
      label,
      inputType = 'text',
      className,
      containerClassName = '',
      ...otherProps
    }: InputProps,
    ref: any
  ) => {
    let inputComponent = null;

    switch (inputType) {
      case 'password':
        inputComponent = (
          <AntdInputPassword
            ref={ref}
            placeholder={placeholder}
            className={`${className} rounded invalid:border-red-500 invalid:text-red-500`}
            iconRender={(visible: boolean) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            {...otherProps}
          />
        );
        break;
      default:
        inputComponent = (
          <AntdInput
            ref={ref}
            placeholder={placeholder}
            className={`${className} flex-1 rounded h-[50px] basis-[50px] invalid:border-red-500 invalid:text-red-500`}
            type={inputType}
            {...otherProps}
          />
        );
        break;
    }

    return (
      <div
        className={`relative pr-input ${
          label ? 'mt-5' : ''
        } ${containerClassName}`}
      >
        {inputComponent}
        {placeholder || otherProps.value ? (
          <label className="duration-75 ease-in absolute bottom-[15px] origin-0 left-[11px] text-gray font-normal pointer-events-none pr-label-top">
            {label}
          </label>
        ) : (
          <label className="duration-75 ease-in absolute bottom-[15px] origin-0 left-[11px] text-gray font-normal pointer-events-none">
            {label}
          </label>
        )}
      </div>
    );
  }
);
export default Input;
