import React from 'react';
import getConfig from 'next/config';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { DisabledButton } from './DisabledButton';
import lightning from '../../../icons/lightning.svg';

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

  return (
    <>
      <div className="text-[3rem] font-bold">{wpName}</div>
      <div className="flex flex-col">
        <div className="flex flex-row items-center text-gray font-semibold">
          <Image src={lightning.src} width={17} height={17} alt="" />
          <div className="ml-2 uppercase">{t('billing.title')}</div>
        </div>
        <div className="flex flex-col ml-6">
          {BILLING_HOME ? (
            <iframe
              height={300}
              src={`${BILLING_HOME.replace(
                /\{\{lang\}\}/,
                language
              )}?workspaceId=${wpId}&email=${userEmail}`}
            ></iframe>
          ) : (
            <>
              <div className="flex flex-row font-semibold text-[1.125rem]">
                {t('billing.free')}
                <DisabledButton>{t('billing.change')}</DisabledButton>
              </div>
              <div className="flex flex-row">
                <div className="text-[0.75rem]">O</div>
                <div className="flex flex-col ml-2 text-gray text-[0.75rem]">
                  {t('billing.limit_ok')}
                  <div>
                    <DisabledButton>{t('billing.cta_premium')}</DisabledButton>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BillingPlan;
