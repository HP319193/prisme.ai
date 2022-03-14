import {
  Button,
  Modal,
  SearchInput,
  Space,
  Title,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Block from '../components/Block';
import IconApps from '../icons/icon-apps.svgr';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import AppsStore from './AppsStore';
import AppsSidebarItem from './AppsSidebarItem';
import { useApps } from '../components/AppsProvider';

export const AppsSidebar = () => {
  const { t } = useTranslation('workspaces');

  const {
    workspace,
    workspace: { id: workspaceId },
    setFullSidebar,
  } = useWorkspace();

  const { appInstances, getAppInstances } = useApps();
  const workspaceAppInstances = appInstances.get(workspaceId);

  const [appStoreVisible, setAppStoreVisible] = useState(false);

  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState<{ title: string; url: string } | null>(
    null
  );
  const [opened, setOpened] = useState(new Set());

  useEffect(() => {
    setFullSidebar(!!opened.size);
  }, [opened, setFullSidebar]);

  useEffect(() => {
    return () => {
      setFullSidebar(false);
    };
  }, [setFullSidebar]);

  const toggleSetup = useCallback((app: string, state: boolean) => {
    setOpened((opened) => {
      const newOpened = new Set(opened);
      if (state) {
        newOpened.add(app);
      } else {
        newOpened.delete(app);
      }
      return newOpened;
    });
  }, []);

  useEffect(() => {
    getAppInstances(workspace.id);
  }, [getAppInstances, workspace]);

  const filteredApps = useMemo(() => {
    if (!workspaceAppInstances) return [];
    return workspaceAppInstances.flatMap((appInstance) => {
      return `${appInstance.slug} ${appInstance.appName}`
        .toLowerCase()
        .match(filter.toLowerCase())
        ? { ...appInstance, slug: appInstance.slug }
        : [];
    });
  }, [filter, workspaceAppInstances]);

  const isEmpty = (workspaceAppInstances || []).length === 0;

  return (
    <>
      <AppsStore
        visible={appStoreVisible}
        onCancel={() => setAppStoreVisible(false)}
      />
      <div className="flex grow h-full flex-col">
        <div className="flex justify-between items-center mb-6">
          <Title level={4} className="mb-0">
            {t('apps.link')}
          </Title>
          <Button onClick={() => setAppStoreVisible(true)}>
            {t('apps.install')}
          </Button>
        </div>
        {isEmpty && (
          <div className="flex flex-1 justify-center items-center flex-col">
            <IconApps width={100} height={100} className="text-gray-200" />
            <div className="mt-4 text-gray">{t('apps.empty')}</div>
            <Button variant="link" onClick={() => setAppStoreVisible(true)}>
              {t('apps.install')}
            </Button>
          </div>
        )}
        {!isEmpty && (
          <>
            <SearchInput
              placeholder={t('search')}
              className="mb-6"
              onChange={({ target: { value } }) => setFilter(value)}
            />
            <Space direction="vertical" className="flex grow overflow-x-auto">
              {filteredApps.map((appInstance: Prismeai.AppInstance) => (
                <AppsSidebarItem
                  key={appInstance.appSlug}
                  workspaceId={workspaceId}
                  {...appInstance}
                  onToggle={toggleSetup}
                />
              ))}
            </Space>
          </>
        )}
        <Modal
          title={modal && modal.title}
          centered
          visible={!!modal}
          onCancel={() => setModal(null)}
          footer={null}
          width="90vw"
          forceRender
        >
          <div className="flex flex-1 h-[80vh] overflow-auto">
            {modal && <Block url={modal.url} token="" entityId="" />}
          </div>
        </Modal>
      </div>
    </>
  );
};

export default AppsSidebar;
