import { useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useUser } from '../../components/UserProvider';
import { useRouter } from 'next/router';
import { Col, Layout, notification, Title } from '@prisme.ai/design-system';
import SignHeader from '../../components/SignHeader';
import SigninForm from '../../components/SigninForm';

export const SignIn = () => {
  const { t } = useTranslation('sign');
  const { push } = useRouter();
  const { error } = useUser();

  useEffect(() => {
    if (!error) return;
    notification.error({
      message: t('in.error', { context: error.error }),
      placement: 'bottomRight',
    });
  }, [error, t]);

  const signedin = useCallback(
    (user: Prismeai.User | null) => {
      if (!user) return;
      push('/workspaces');
    },
    [push]
  );

  return (
    <Layout Header={<SignHeader />} className="!bg-blue-200 pt-14">
      <div className="flex grow justify-evenly mt-32">
        <Col span={12}>
          <div className="flex items-center flex-col">
            <div>
              <Title>{t('in.header')}</Title>
              <Trans
                t={t}
                i18nKey="in.description"
                values={{
                  url: '/signup',
                }}
                components={{
                  a: <a href={`signup`} />,
                }}
              />
            </div>
          </div>
        </Col>
        <Col span={12}>
          <div className="flex items-center flex-col">
            <SigninForm onSignin={signedin} />
          </div>
        </Col>
      </div>
    </Layout>
  );
};

export default SignIn;
