import { useCallback, useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { useUser } from '../../components/UserProvider';
import { useRouter } from 'next/router';
import { notification, Title } from '@prisme.ai/design-system';
import SigninForm from '../../components/SigninForm';
import icon from '../../icons/icon-prisme.svg';
import Image from 'next/image';

export const SignIn = () => {
  const { t } = useTranslation('sign');
  const { push } = useRouter();
  const { error } = useUser();

  useEffect(() => {
    if (!error) return;
    notification.error({
      message: t('in.error', { context: error.error }),
      placement: 'bottomRight',
    });
  }, [error, t]);

  const signedin = useCallback(
    (user: Prismeai.User | null) => {
      if (!user) return;
      push('/workspaces');
    },
    [push]
  );

  return (
    <div className="flex grow flex-col-reverse md:flex-row overflow-y-auto">
      <div className="!flex flex-col bg-gradient-to-br from-[#0A1D3B] to-[#0F2A54] items-center justify-center md:w-[40vw]">
        <div className="hidden md:flex flex-col grow justify-center w-full space-y-4 lg:space-y-6">
          <div className="w-1/2 h-4 lg:h-8 bg-accent rounded-r-[100rem]" />
          <div className="w-1/2 h-4 lg:h-8 bg-pr-orange rounded-r-[100rem]" />
          <div className="w-1/2 h-4 lg:h-8 bg-pr-grey rounded-r-[100rem]" />
        </div>
        <div className="flex grow flex-col justify-end mb-10">
          <div className="flex items-center flex-col text-white p-[10%]">
            <div className="font-normal text-xl md:text-2xl xl:text-5xl leading-normal">
              <Trans
                t={t}
                i18nKey="in.header"
                components={{
                  b: <span className="font-bold" />,
                }}
              />

              <div className="flex flex-row  mt-20">
                <Image src={icon} width={16} height={16} alt="Prisme.ai" />
                <div className="ml-2 !font-light tracking-[.4em] text-sm">
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
              {t('in.topForm1')}
            </div>
            <Title className="text-center">{t('in.topForm2')}</Title>
            <div className="text-center">
              <Trans
                t={t}
                i18nKey="in.topForm3"
                values={{
                  url: '/signup',
                }}
                components={{
                  a: <a href={`signup`} />,
                }}
              />
            </div>
          </div>
          <SigninForm onSignin={signedin} />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
