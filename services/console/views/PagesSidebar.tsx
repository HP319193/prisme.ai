import { Button, Title } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import IconPages from '../icons/icon-pages.svgr';

export const PagesSidebar = () => {
  const { t } = useTranslation('workspaces');
  return (
    <div className="flex grow h-full flex-col">
      <div className="flex justify-between items-center mb-6">
        <Title level={4} className="mb-0">
          {t('pages.link')}
        </Title>
        <Button disabled>{t('pages.create.label')}</Button>
      </div>
      <div className="flex flex-1 justify-center items-center flex-col">
        <IconPages width={100} height={100} className="text-gray-200" />
        <div className="mt-4 text-gray">{t('pages.soon')}</div>
      </div>
    </div>
  );
};

export default PagesSidebar;
