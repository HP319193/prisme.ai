import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';
import ConfirmButton from '../../components/ConfirmButton';
import api from '../../utils/api';

export const SecurityForm = () => {
  const { t } = useTranslation('user');

  const deleteAccount = useCallback(() => {
    api.users().sendDeleteValidation();
  }, []);

  return (
    <div className="">
      <h2 className="text-lg font-bold">
        {t('account.security.delete.title')}
      </h2>
      <p className="my-2">{t('account.security.delete.description')}</p>
      <ConfirmButton
        variant="primary"
        confirmLabel={t('account.security.delete.confirm')}
        yesLabel={t('account.security.delete.yes')}
        noLabel={t('account.security.delete.no')}
        onConfirm={deleteAccount}
        className="ant-btn-warning"
      >
        {t('account.security.delete.label')}
      </ConfirmButton>
    </div>
  );
};

export default SecurityForm;
