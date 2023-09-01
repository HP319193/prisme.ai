import { useTranslation } from 'next-i18next';
import SigninForm from '../../console/components/SigninForm';

export const Signin = () => {
  const { t } = useTranslation('sign');

  return (
    <div className="flex m-auto">
      <SigninForm onSignin={(user) => {}} show403={t('pages.restricted')} />
    </div>
  );
};

export default Signin;
