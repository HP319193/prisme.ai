import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useRouter } from 'next/router';
import { useUser } from '../../components/UserProvider';
import { SignLayout, SignType } from '../../components/SignLayout';
import api, { HTTPError } from '../../utils/api';

export const ConfirmDelete = () => {
  const { t } = useTranslation('sign');
  const router = useRouter();
  const { validationToken } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    async function deleteUser() {
      try {
        await api.users(user.id).delete(`${validationToken}`);
      } catch (e) {
        setError((e as HTTPError).message);
      }
      setLoading(false);
    }
    deleteUser();
  }, [user, validationToken]);

  if (loading) return null;
  return (
    <SignLayout
      type={error ? SignType.DeleteAccountError : SignType.DeleteAccount}
    >
      {error && (
        <div className="text-center m-2">
          {t('account.delete.error.message', { context: error })}
        </div>
      )}
    </SignLayout>
  );
};

ConfirmDelete.isPublic = true;

export default ConfirmDelete;
