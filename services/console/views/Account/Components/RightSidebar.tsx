import { useTranslation } from 'next-i18next';
import { DisabledButton } from './DisabledButton';

interface RightSidebarProps {}

const RightSidebar = ({}: RightSidebarProps) => {
  const { t } = useTranslation('user');

  return (
    <div className="flex flex-col m-4 space-y-5 w-1/5">
      <div className="space-y-1">
        <div className="text-gray font-semibold">{t('billing.payment')}</div>
        <DisabledButton>{t('billing.payment_add')}</DisabledButton>
        {/*<Button*/}
        {/*  variant="link"*/}
        {/*  className="!flex justify-start !p-0"*/}
        {/*  disabled*/}
        {/*>*/}
        {/*  {t('billing.payment_add')}*/}
        {/*</Button>*/}
      </div>
      <div className="space-y-1">
        <div className="text-gray font-semibold">{t('billing.invoice')}</div>
        <DisabledButton>{t('billing.invoice_details')}</DisabledButton>
        {/*<Button*/}
        {/*  variant="link"*/}
        {/*  className="!flex justify-start !p-0"*/}
        {/*  disabled*/}
        {/*>*/}
        {/*  {t('billing.invoice_details')}*/}
        {/*</Button>*/}
      </div>
      <div className="space-y-1">
        <div className="text-gray font-semibold">{t('billing.history')}</div>
      </div>
    </div>
  );
};

export default RightSidebar;
