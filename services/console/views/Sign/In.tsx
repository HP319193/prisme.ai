import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useUser } from '../../components/UserProvider';
import { useRouter } from 'next/router';
import { notification } from '@prisme.ai/design-system';
import SigninForm from '../../components/SigninForm';
import { SignLayout, SignType } from '../../components/SignLayout';

export const SignIn = () => {
  const { t } = useTranslation('sign');
  const { push, query = {} } = useRouter();
  const { error, validateMail, success, initAuthentication } = useUser();

  const { validationToken: token } = query;

  useEffect(() => {
    if (!token || typeof token !== 'string') return;
    validateMail(token).then(() => {
      setTimeout(() => {
        initAuthentication();
      }, 2000);
    });
  }, [token, validateMail]);

  useEffect(() => {
    if (!error) return;
    notification.error({
      message: t('in.error', { context: error.error }),
      placement: 'bottomRight',
    });
  }, [error, t]);

  useEffect(() => {
    if (!success) return;
    notification.success({
      message: t('in.success', { context: success.type }),
      placement: 'bottomRight',
    });
  }, [success, t]);

  const signedin = useCallback(
    (user: Prismeai.User | null) => {
      if (!user) return;
      push('/workspaces');
    },
    [push]
  );

  return (
    <SignLayout type={SignType.In} link="signup">
      {token ? null : <SigninForm onSignin={signedin} provider="prismeai" />}
    </SignLayout>
  );
};

export default SignIn;
