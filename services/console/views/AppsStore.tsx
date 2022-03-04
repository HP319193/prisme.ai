import { useEffect } from 'react';
import Image from 'next/image';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { Button, SearchInput, Title } from '@prisme.ai/design-system';
import { useApps } from '../components/AppsProvider';
import IconApps from '../icons/icon-apps.svgr';

interface AppStoreProps {
  visible: boolean;
  onCancel: () => void;
}

const AppsStore = ({ visible, onCancel }: AppStoreProps) => {
  const { t } = useTranslation('workspaces');
  const { apps, getApps } = useApps();

  useEffect(() => {
    if (visible) {
      getApps();
    }
  }, [getApps, visible]);

  return (
    <Modal
      onCancel={onCancel}
      visible={visible}
      footer={null}
      title={<div>{t('apps.store.title')}</div>}
      width={'80vw'}
    >
      <div className="flex items-center justify-between">
        <SearchInput className="!min-w-[20rem]" />
        <Button variant="primary">{t('apps.store.create')}</Button>
      </div>
      <div className="flex flex-wrap flex-row align-start justify-start mt-5">
        {Array.from(apps).map(([_, { id, name, description, photo }]) => (
          <div
            key={id}
            className="flex flex-row w-[25rem] align-center items-center border rounded border-gray-200 p-4 space-x-5 h-[9rem]"
          >
            <div className="flex align-center justify-center w-[6rem]">
              {photo ? (
                <Image
                  src={photo}
                  width={80}
                  height={80}
                  alt={t('apps.photoAlt')}
                />
              ) : (
                <IconApps width={80} height={80} className="text-gray-200" />
              )}
            </div>
            <div className="flex flex-col grow justify-start h-full mt-3">
              <Title level={4}>{name}</Title>
              <div>description</div>
              {/*  Get description language, fallback to en */}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default AppsStore;
