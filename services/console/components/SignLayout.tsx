import { Trans, useTranslation } from 'react-i18next';

import { Title } from '@prisme.ai/design-system';
import icon from '../icons/icon-prisme.svg';
import Image from 'next/image';
import LinkInTrans from './LinkInTrans';
import getConfig from 'next/config';

interface AuthProvider {
  name: string;
  extends?: string;
  label?: Prismeai.LocalizedText;
  icon?: string;
  url?: string;
}

const { publicRuntimeConfig } = getConfig();

const ENABLED_AUTH_PROVIDERS: AuthProvider[] =
  publicRuntimeConfig.ENABLED_AUTH_PROVIDERS || [{ name: 'local' }];

const hasLocalSignup = ENABLED_AUTH_PROVIDERS.some(
  ({ name }) => name === 'local'
);

export enum SignType {
  In = 'in',
  Up = 'up',
  Forgot = 'forgot',
  Reset = 'reset',
  Validate = 'validate',
  Manual = 'validate.manual',
}

export const SignLayout = ({
  children,
  type,
  link,
}: {
  children: React.ReactNode;
  type: SignType;
  link: string;
}) => {
  const { t } = useTranslation('sign');

  return (
    <div className="flex flex-1 flex-col-reverse md:flex-row overflow-y-auto">
      <div className="!flex flex-col bg-gradient-to-br from-[#0A1D3B] to-[#0F2A54] items-center justify-center md:w-[40vw]">
        <div className="flex invisible md:visible flex-col flex-1 justify-center w-full space-y-4 lg:space-y-6">
          <div className="w-1/2 h-4 lg:h-8 bg-accent rounded-r-[100rem]" />
          <div className="w-1/2 h-4 lg:h-8 bg-pr-orange rounded-r-[100rem]" />
          <div className="w-1/2 h-4 lg:h-8 bg-pr-grey rounded-r-[100rem]" />
        </div>
        <div className="flex flex-1 flex-col justify-end mb-10">
          <div className="flex flex-1 items-center flex-col text-white">
            <div className="flex flex-1 flex-col font-normal text-[1rem] md:text-[2rem] xl:text-[3.375rem] leading-normal">
              <div className="flex flex-1 flex-col justify-center">
                <Trans
                  t={t}
                  i18nKey="in.header"
                  components={{
                    b: <span className="font-bold" />,
                  }}
                />
              </div>

              <div className="flex flex-row  mt-20">
                <Image src={icon} width={16} height={16} alt="Prisme.ai" />
                <div className="ml-2 !font-light tracking-[.4em] text-[1.125rem] uppercase">
                  {t('main.title', { ns: 'common' })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="!flex flex-1 items-center justify-center md:w-[60vw] md:h-[100vh]">
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center space-y-4 mb-16 mt-8">
            <div className="text-accent !font-light tracking-[.3em] uppercase text-xs">
              {t(`${type}.topForm1`)}
            </div>
            <Title className="text-center !text-3xl">
              {t(`${type}.topForm2`)}
            </Title>
            {hasLocalSignup && (
              <div className="text-center">
                <Trans
                  t={t}
                  i18nKey={`${type}.topForm3`}
                  values={{
                    url: `/${link}`,
                  }}
                  components={{
                    a: <LinkInTrans href={`${link}`} className="text-link" />,
                  }}
                />
              </div>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
