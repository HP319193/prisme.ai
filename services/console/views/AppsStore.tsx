import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { Button, SearchInput, Title } from '@prisme.ai/design-system';
import { useApps } from '../components/AppsProvider';
import IconApps from '../icons/icon-apps.svgr';
import { useWorkspaces } from '../components/WorkspacesProvider';
import { useWorkspace } from '../layouts/WorkspaceLayout';

interface AppStoreProps {
  visible: boolean;
  onCancel: () => void;
}

interface FilteredApps extends Prismeai.App {
  id: string;
  name: string;
}

const isFilteredApp = (app: Prismeai.App): app is FilteredApps => {
  return !!app.id && !!app.name;
};

const AppsStore = ({ visible, onCancel }: AppStoreProps) => {
  const { t } = useTranslation('workspaces');
  const { apps, getApps } = useApps();
  const { installApp } = useWorkspaces();
  const {
    workspace: { id: workspaceId },
  } = useWorkspace();
  const [filter, setFilter] = useState('');

  const filteredApps: FilteredApps[] = useMemo(
    () =>
      Array.from(apps)
        .flatMap(([key, app]) => {
          return `${app.name}`.toLowerCase().match(filter.toLowerCase())
            ? { ...app }
            : [];
        })
        .filter(isFilteredApp),
    [apps, filter]
  );

  useEffect(() => {
    if (visible) {
      getApps();
    }
  }, [getApps, visible]);

  const onAppClick = useCallback(
    async (id: string, name: string) => {
      await installApp(workspaceId, {
        appId: id,
        appName: name,
      });
    },
    [installApp]
  );

  return (
    <Modal
      onCancel={onCancel}
      visible={visible}
      footer={null}
      title={<div>{t('apps.store.title')}</div>}
      width="80vw"
    >
      <div className="h-[70vh]">
        <div className="flex items-center justify-between">
          <SearchInput
            className="!min-w-[20rem]"
            onChange={({ target: { value } }) => setFilter(value)}
            placeholder={t('apps.search')}
          />
          <Button variant="primary">{t('apps.store.create')}</Button>
        </div>
        <div className="flex flex-wrap flex-row align-start justify-start mt-5">
          {filteredApps.map(({ id, name, description, photo }) => (
            <div
              key={id}
              className="flex flex-row w-[25rem] align-center items-center border rounded border-gray-200 p-4 space-x-5 h-[9rem] cursor-pointer hover:bg-blue-200"
              onClick={() => onAppClick(id, name)}
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
      </div>
    </Modal>
  );
};

export default AppsStore;
