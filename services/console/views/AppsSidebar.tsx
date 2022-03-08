import { Button, SearchInput, Space, Title } from '@prisme.ai/design-system';
import { Modal } from 'antd';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import Block from '../components/Block';
import IconApps from '../icons/icon-apps.svgr';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import AppsStore from './AppsStore';
import AppsSidebarItem from './AppsSidebarItem';

export const AppsSidebar = () => {
  const { t } = useTranslation('workspaces');
  const { push } = useRouter();

  const {
    workspace,
    workspace: { id: workspaceId, imports = {} },
  } = useWorkspace();
  const [appStoreVisible, setAppStoreVisible] = useState(false);

  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState<{ title: string; url: string } | null>(
    null
  );

  const filteredApps = useMemo(() => {
    return Object.keys(imports).flatMap((key) => {
      const { appName } = imports[key];
      return `${key} ${appName}`.toLowerCase().match(filter.toLowerCase())
        ? { ...imports[key], slug: key }
        : [];
    });
  }, [filter, imports]);

  const setup = useCallback((key: string) => {
    console.log('setup', key);
    // const app = imports[key];
    // const { setup } = app.widgets || {};
    // if (!setup) return;
    // setModal({
    //   title: key,
    //   url: setup.url,
    // });
  }, []);

  const isEmpty = Object.keys(imports).length === 0;

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
            <div className="mt-4 text-gray">{t('apps.soon')}</div>
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
              {/*{filteredApps.map(({ appName, slug, widgets }) => (*/}
              {filteredApps.map((appInstance: Prismeai.AppInstance) => (
                <AppsSidebarItem key={appInstance.appSlug} {...appInstance} />
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
