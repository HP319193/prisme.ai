import lightning from '../../../icons/lightning.svg';
import React from 'react';
import { DisabledButton } from './DisabledButton';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';

interface BillingPlanProps {
  wpName: string;
}

const BillingPlan = ({ wpName }: BillingPlanProps) => {
  const { t } = useTranslation('user');

  return (
    <>
      <div className="text-[3rem] font-bold">{wpName}</div>
      <div className="flex flex-col">
        <div className="flex flex-row items-center text-gray font-semibold">
          <Image src={lightning.src} width={17} height={17} alt="" />
          <div className="ml-2 uppercase">{t('billing.title')}</div>
        </div>
        <div className="flex flex-col ml-6">
          <div className="flex flex-row font-semibold text-[1.125rem]">
            {t('billing.free')}
            <DisabledButton>{t('billing.change')}</DisabledButton>
            {/*<Button*/}
            {/*  disabled*/}
            {/*  variant="link"*/}
            {/*  className="!flex items-center justify-start !p-0 !text-[0.75rem] ml-2"*/}
            {/*>*/}
            {/*  {t('billing.change')}*/}
            {/*</Button>*/}
          </div>
          <div className="flex flex-row">
            <div className="text-[0.75rem]">O</div>
            <div className="flex flex-col ml-2 text-gray text-[0.75rem]">
              {t('billing.limit_ok')}
              <div>
                <DisabledButton>{t('billing.cta_premium')}</DisabledButton>
                {/*<Button*/}
                {/*  disabled*/}
                {/*  variant="link"*/}
                {/*  className="!flex items-center justify-start !p-0 !text-[0.75rem]"*/}
                {/*>*/}
                {/*  {t('billing.cta_premium')}*/}
                {/*</Button>*/}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BillingPlan;
