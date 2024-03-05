import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { notification } from '@prisme.ai/design-system';

import { useRouter } from 'next/router';
import { useUser } from '../../components/UserProvider';
import { SignLayout, SignType } from '../../components/SignLayout';
import ValidateForm from '../../components/ValidateForm';

export const Validate = () => {
  const { t } = useTranslation('sign');
  const router = useRouter();
  const { email, sent } = router.query;

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

  return (
    <SignLayout type={SignType.Validate} link="signup">
      <ValidateForm email={email as string} sent={!!sent} />
    </SignLayout>
  );
};

Validate.isPublic = true;

export default Validate;
