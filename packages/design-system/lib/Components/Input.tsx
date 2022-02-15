import { Input as AntdInput, InputProps as AntdInputProps } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

const { Password: AntdInputPassword } = AntdInput;

export interface InputProps extends AntdInputProps {
  placeholder?: string;
  label?: string;
  inputType?: 'text' | 'password';
  className?: string;
}

const Input = ({
  placeholder,
  label,
  inputType = 'text',
  className,
  ...otherProps
}: InputProps) => {
  let inputComponent = null;

  switch (inputType) {
    case 'password':
      inputComponent = (
        <AntdInputPassword
          placeholder={placeholder}
          className={`${className} rounded h-[50px] basis-[50px]`}
          iconRender={(visible: boolean) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
          {...otherProps}
        />
      );
      break;
    default:
    case 'text':
      inputComponent = (
        <AntdInput
          placeholder={placeholder}
          className={`${className} rounded h-[50px] basis-[50px]`}
          {...otherProps}
        />
      );
      break;
  }

  return (
    <div className={`relative pr-input ${label ? 'mt-5' : ''}`}>
      {inputComponent}
      {placeholder || otherProps.value ? (
        <label className="duration-75 ease-in absolute bottom-[15px] origin-0 left-[11px] text-gray font-normal pointer-events-none pr-label--with-placeholder">
          {label}
        </label>
      ) : (
        <label className="duration-75 ease-in absolute bottom-[15px] origin-0 left-[11px] text-gray font-normal pointer-events-none">
          {label}
        </label>
      )}
    </div>
  );
};
export default Input;
