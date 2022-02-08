import { Input as AntdInput } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

const { Password: AntdInputPassword } = AntdInput;

export interface InputProps {
  placeholder: string;
  type?: 'text' | 'password';
}

const Input = ({ placeholder, type = 'text' }: InputProps) => {
  switch (type) {
    case 'password':
      return (
        <AntdInputPassword
          placeholder={placeholder}
          className="rounded"
          iconRender={(visible: boolean) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
        />
      );
    default:
    case 'text':
      return <AntdInput placeholder={placeholder} className="rounded" />;
  }
};
export default Input;
