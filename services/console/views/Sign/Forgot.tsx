import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { notification } from '@prisme.ai/design-system';
import ForgotForm from '../../components/ForgotForm';
import ResetForm from '../../components/ResetForm';

import { useRouter } from 'next/router';
import { useUser } from '../../components/UserProvider';
import { SignLayout, SignType } from '../../components/SignLayout';

export const Forgot = () => {
  const { t } = useTranslation('sign');
  const router = useRouter();
  const { token } = router.query;

  const { error, success } = useUser();

  useEffect(() => {
    if (!error) return;
    notification.error({
      message: t('forgot.error', { context: error.error }),
      placement: 'bottomRight',
    });
  }, [error, t]);

  useEffect(() => {
    if (!success) return;
    notification.success({
      message: t('forgot.success', { context: success.type }),
      placement: 'bottomRight',
    });
  }, [success, t]);

  if (token && typeof token === 'string') {
    return (
      <SignLayout type={SignType.Reset} link="signup">
        <ResetForm token={token} />
      </SignLayout>
    );
  }

  return (
    <SignLayout type={SignType.Forgot} link="signup">
      <ForgotForm />
    </SignLayout>
  );
};

export default Forgot;
