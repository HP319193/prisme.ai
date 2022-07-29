import { Button, SearchInput, Space, Title } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import IconApps from '../icons/icon-apps.svgr';
import AppsStore from './AppsStore';
import AppsSidebarItem from './Apps';
import { useApps } from '../components/AppsProvider';
import { useWorkspace } from '../components/WorkspaceProvider';
import { useWorkspaceLayout } from '../layouts/WorkspaceLayout/context';

export const AppsSidebar = () => {
  const { t } = useTranslation('workspaces');
  const { t: commonT } = useTranslation();

  const {
    workspace,
    workspace: { id: workspaceId },
  } = useWorkspace();

  const { setFullSidebar } = useWorkspaceLayout();

  const { appInstances, getAppInstances } = useApps();

  const workspaceAppInstances = appInstances.get(workspaceId);

  const [appStoreVisible, setAppStoreVisible] = useState(false);

  const [filter, setFilter] = useState('');
  const [opened, setOpened] = useState(new Set());

  useEffect(() => {
    if (opened.size > 0) {
      setFullSidebar(true);
    }
  }, [opened, setFullSidebar]);

  const toggleSetup = useCallback((app: string, state: boolean) => {
    setOpened((opened) => {
      if ((state && opened.has(app)) || (!state && !opened.has(app)))
        return opened;
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
      <div className="flex grow h-full flex-col w-full">
        <div className="flex justify-between items-center mb-6">
          <Title level={4} className="mb-0">
            {t('apps.link')}
          </Title>
          <Button onClick={() => setAppStoreVisible(true)}>
            {t('apps.install')}
          </Button>
        </div>
        {isEmpty && (
          <Button
            className="!flex flex-1 justify-center items-center flex-col"
            variant="link"
            onClick={() => setAppStoreVisible(true)}
          >
            <IconApps width={100} height={100} className="text-gray-200" />
            <div className="mt-4 text-gray">{t('apps.empty')}</div>
            {t('apps.install')}
          </Button>
        )}
        {!isEmpty && (
          <>
            <SearchInput
              placeholder={commonT('search')}
              className="mb-6"
              onChange={({ target: { value } }) => setFilter(value)}
            />
            <Space direction="vertical" className="flex grow overflow-x-auto">
              {filteredApps.map((appInstance: Prismeai.DetailedAppInstance) => (
                <AppsSidebarItem
                  key={appInstance.slug || appInstance.appSlug}
                  workspaceId={workspaceId}
                  {...appInstance}
                  onToggle={toggleSetup}
                />
              ))}
            </Space>
          </>
        )}
      </div>
    </>
  );
};

export default AppsSidebar;
