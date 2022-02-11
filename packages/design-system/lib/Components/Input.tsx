import { Input as AntdInput, InputProps as AntdInputProps } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

const { Password: AntdInputPassword } = AntdInput;

export interface InputProps extends AntdInputProps {
  placeholder?: string;
  inputType?: 'text' | 'password';
  className?: string;
}

const Input = ({
  placeholder,
  type = 'text',
  className,
  ...otherProps
}: InputProps) => {
  switch (type) {
    case 'password':
      return (
        <AntdInputPassword
          placeholder={placeholder}
          className={`${className} rounded`}
          iconRender={(visible: boolean) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
          {...otherProps}
        />
      );
    default:
    case 'text':
      return (
        <AntdInput
          placeholder={placeholder}
          className={`${className} rounded`}
          {...otherProps}
        />
      );
  }
};
export default Input;
