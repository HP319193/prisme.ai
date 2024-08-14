import React from 'react';
import getConfig from 'next/config';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { DisabledButton } from './DisabledButton';
import lightning from '../../icons/lightning.svg';

interface BillingPlanProps {
  wpName: string;
  wpId: string;
  userEmail: string;
}

const {
  publicRuntimeConfig: { BILLING_HOME = '' },
} = getConfig();

const BillingPlan = ({ wpName, wpId, userEmail }: BillingPlanProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('user');
  if (!BILLING_HOME) return null;
  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-row items-center text-gray font-semibold">
          <Image src={lightning.src} width={17} height={17} alt="" />
          <div className="ml-2 uppercase">{t('billing.title')}</div>
        </div>
        <div className="flex flex-col">
          <iframe
            height={200}
            src={`${BILLING_HOME.replace(
              /\{\{lang\}\}/,
              language
            )}?workspaceId=${wpId}&email=${userEmail}`}
          ></iframe>
        </div>
      </div>
    </>
  );
};

export default BillingPlan;
