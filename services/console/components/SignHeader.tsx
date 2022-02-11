import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Title } from '@prisme.ai/design-system';

import icon from '../icons/icon-prisme.svg';

const SignHeader = () => {
  const { t } = useTranslation();
  return (
    <div className="ml-24">
      <Title level={4} className="flex flex-row">
        <Image src={icon} width={16} height={16} />
        <div className="ml-2 !font-light tracking-[.5em]">PRISME.AI</div>
      </Title>
      <meta name="description" content={t('in.description')} />
    </div>
  );
};

export default SignHeader;
