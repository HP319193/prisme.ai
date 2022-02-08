import { Input, Button } from '../';
import { Space } from 'antd';

export interface LoginFormProps {
  t: Function;
}

const LoginForm = ({ t }: LoginFormProps) => {
  return (
    <Space size="middle" direction="vertical">
      <Input placeholder={t('login.username')} />
      <Input placeholder={t('login.password')} type="password" />
      <Button type="plain" className="w-full">
        {t('login.button')}
      </Button>
    </Space>
  );
};

export default LoginForm;
