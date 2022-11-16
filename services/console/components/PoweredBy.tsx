import { Trans, useTranslation } from 'next-i18next';
import logo from '../icons/icon-prisme.svg';
import Image from 'next/image';

export const PoweredBy = () => {
  const { t } = useTranslation('common');
  return (
    <a
      href="https://prisme.ai"
      target="_blank"
      rel="noreferrer"
      className="
        pr-poweredby
        absolute left-10 bottom-10 z-50
        text-[0.75rem] text-pr-grey
        flex justify-center items-center pr-2
      bg-white border-gray-200 border-[1px] rounded-[4px]"
      style={{
        boxShadow: '0 2px 2px #888',
      }}
    >
      <div className="flex m-2">
        <Image {...logo} width="16px" height="16px" alt="Prisme.ai" />
      </div>
      <div>{t('powered')}</div>
    </a>
  );
};

export default PoweredBy;