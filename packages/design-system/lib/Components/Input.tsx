import { Input as AntdInput, InputProps as AntdInputProps } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { forwardRef } from 'react';
import FloatingLabel from './Internal/FloatingLabel';

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
    <FloatingLabel
      className={containerClassName}
      label={label}
      component={inputComponent}
      raisedPlaceholder={!!(placeholder || otherProps.value)}
    />
  );
};
export default Input;
