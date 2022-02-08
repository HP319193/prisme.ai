import { ReactElement } from 'react';
import { LoginForm, Layout, Title } from '../';

export interface LoginPageProps {
  t: Function;
  logoBig: ReactElement;
}

const LoginPage = ({ logoBig, t }: LoginPageProps) => (
  <Layout
    Header={<div className="ml-24">{logoBig}</div>}
    className="pt-14 pr-24 bg-blue-200"
  >
    <div className="flex grow justify-evenly mt-32">
      <div className="">
        <Title>{t('login.header')}</Title>
        <div className="">{t('login.description')}</div>
      </div>
      <LoginForm t={t} />
    </div>
  </Layout>
);

export default LoginPage;
