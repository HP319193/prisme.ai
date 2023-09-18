import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import SigninForm from '../../console/components/SigninForm';
import { useUser } from '../../console/components/UserProvider';

export const Signin = () => {
  const { t } = useTranslation('sign');
  const { query: { validationToken } = {} } = useRouter();
  const { validateMail, initAuthentication } = useUser();

  useEffect(() => {
    async function validate() {
      if (!validationToken || typeof validationToken !== 'string') return;
      await validateMail(validationToken);
      setTimeout(() => {
        initAuthentication();
      }, 500);
    }
    validate();
  }, [initAuthentication, validationToken, validateMail]);

  return (
    <div className="flex m-auto">
      <SigninForm onSignin={(user) => {}} show403={t('pages.restricted')} />
    </div>
  );
};

export default Signin;
