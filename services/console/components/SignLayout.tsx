import { Trans, useTranslation } from 'react-i18next';

import { Title } from '@prisme.ai/design-system';
import icon from '../icons/icon-prisme.svg';
import Image from 'next/image';

export enum SignType {
  In = 'in',
  Up = 'up',
  Forgot = 'forgot',
  Reset = 'reset',
  Validate = 'validate',
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
              {t(`${type}.topForm1`)}
            </div>
            <Title className="text-center">{t(`${type}.topForm2`)}</Title>
            <div className="text-center">
              <Trans
                t={t}
                i18nKey={`${type}.topForm3`}
                values={{
                  url: `/${link}`,
                }}
                components={{
                  a: <a href={`${link}`} />,
                }}
              />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
