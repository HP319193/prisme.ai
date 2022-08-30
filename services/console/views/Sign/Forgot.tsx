import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { notification, Title } from '@prisme.ai/design-system';
import ForgotForm from '../../components/ForgotForm';
import ResetForm from '../../components/ResetForm';
import icon from '../../icons/icon-prisme.svg';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useUser } from '../../components/UserProvider';

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
      <div className="flex grow flex-col-reverse md:flex-row overflow-y-auto">
        <div className="!flex flex-col bg-gradient-to-br from-[#0A1D3B] to-[#0F2A54] items-center justify-center md:w-[40vw]">
          <div className="flex invisible md:visible flex-col grow justify-center w-full space-y-4 lg:space-y-6">
            <div className="w-1/2 h-4 lg:h-8 bg-accent rounded-r-[100rem]" />
            <div className="w-1/2 h-4 lg:h-8 bg-pr-orange rounded-r-[100rem]" />
            <div className="w-1/2 h-4 lg:h-8 bg-pr-grey rounded-r-[100rem]" />
          </div>
          <div className="flex grow flex-col justify-end mb-10">
            <div className="flex items-center flex-col text-white p-[10%]">
              <div className="font-normal text-[1rem] md:text-[2rem] xl:text-[3.375rem] leading-normal">
                <Trans
                  t={t}
                  i18nKey="in.header"
                  components={{
                    b: <span className="font-bold" />,
                  }}
                />

                <div className="flex flex-row  mt-20">
                  <Image src={icon} width={16} height={16} alt="Prisme.ai" />
                  <div className="ml-2 !font-light tracking-[.4em] text-[1.125rem]">
                    PRISME.AI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="!flex grow items-center justify-center md:w-[60vw] md:h-[100vh]">
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center space-y-4 mb-16 mt-8">
              <div className="text-accent !font-light tracking-[.3em]">
                {t('reset.topForm1')}
              </div>
              <Title className="text-center">{t('reset.topForm2')}</Title>
              <div className="text-center">
                <Trans
                  t={t}
                  i18nKey="reset.topForm3"
                  values={{
                    url: '/signup',
                  }}
                  components={{
                    a: <a href={`signup`} />,
                  }}
                />
              </div>
            </div>
            <ResetForm token={token} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex grow flex-col-reverse md:flex-row overflow-y-auto">
      <div className="!flex flex-col bg-gradient-to-br from-[#0A1D3B] to-[#0F2A54] items-center justify-center md:w-[40vw]">
        <div className="flex invisible md:visible flex-col grow justify-center w-full space-y-4 lg:space-y-6">
          <div className="w-1/2 h-4 lg:h-8 bg-accent rounded-r-[100rem]" />
          <div className="w-1/2 h-4 lg:h-8 bg-pr-orange rounded-r-[100rem]" />
          <div className="w-1/2 h-4 lg:h-8 bg-pr-grey rounded-r-[100rem]" />
        </div>
        <div className="flex grow flex-col justify-end mb-10">
          <div className="flex items-center flex-col text-white p-[10%]">
            <div className="font-normal text-[1rem] md:text-[2rem] xl:text-[3.375rem] leading-normal">
              <Trans
                t={t}
                i18nKey="in.header"
                components={{
                  b: <span className="font-bold" />,
                }}
              />

              <div className="flex flex-row  mt-20">
                <Image src={icon} width={16} height={16} alt="Prisme.ai" />
                <div className="ml-2 !font-light tracking-[.4em] text-[1.125rem]">
                  PRISME.AI
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="!flex grow items-center justify-center md:w-[60vw] md:h-[100vh]">
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center space-y-4 mb-16 mt-8">
            <div className="text-accent !font-light tracking-[.3em]">
              {t('forgot.topForm1')}
            </div>
            <Title className="text-center">{t('forgot.topForm2')}</Title>
            <div className="text-center">
              <Trans
                t={t}
                i18nKey="forgot.topForm3"
                values={{
                  url: '/signup',
                }}
                components={{
                  a: <a href={`signup`} />,
                }}
              />
            </div>
          </div>
          <ForgotForm />
        </div>
      </div>
    </div>
  );
};

export default Forgot;
