import { Input as AntdInput, InputProps as AntdInputProps } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { forwardRef } from 'react';
import { WithLabel } from '../';

const { Password: AntdInputPassword } = AntdInput;

export interface InputProps extends AntdInputProps {
  placeholder?: string;
  label?: string;
  inputType?: AntdInputProps['type'];
  className?: string;
  containerClassName?: string;
  overrideContainerClassName?: string;
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
      overrideContainerClassName,
      defaultValue,
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
            className={`${className} invalid:border-red-500 invalid:text-red-500`}
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
            className={`${className} h-[2.5rem] basis-[2.5rem] invalid:border-red-500 invalid:text-red-500`}
            type={inputType}
            {...otherProps}
          />
        );
        break;
    }

    return (
      <WithLabel
        overrideClassName={overrideContainerClassName}
        className={containerClassName}
        label={label}
      >
        {inputComponent}
      </WithLabel>
    );
  }
);

export default Input;
