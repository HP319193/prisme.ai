import { SettingOutlined } from '@ant-design/icons';
import {
  Button,
  ListItem,
  SearchInput,
  Space,
  Title,
} from '@prisme.ai/design-system';
import { Modal } from 'antd';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import Block from '../components/Block';
import IconApps from '../icons/icon-apps.svgr';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import AppsStore from './AppsStore';

const imports: Record<
  string,
  {
    appName: string;
    appId: string;
    config: Record<string, any>;
    widgets: Record<string, { url: string }>;
  }
> = {
  'my functions': {
    appName: 'run code',
    appId: 'prout',
    config: {},
    widgets: {
      setup: {
        url: 'http://localhost:5433/main.js',
      },
    },
  },
  'my other functions': {
    appName: 'run code',
    appId: 'prout',
    config: {},
    widgets: {
      setup: {
        url: 'http://localhost:5433/main.js',
      },
    },
  },
};

export const AppsSidebar = () => {
  const { t } = useTranslation('workspaces');
  const { push } = useRouter();

  const {
    workspace,
    workspace: { id: workspaceId },
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
  }, [filter]);

  const setup = useCallback((key: string) => {
    console.log('setup', key);
    const app = imports[key];
    const { setup } = app.widgets || {};
    if (!setup) return;
    setModal({
      title: key,
      url: setup.url,
    });
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
            {t('apps.create.label')}
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
              {filteredApps.map(({ appName, slug, widgets }) => (
                <Link
                  key={slug}
                  href={`/workspaces/${workspaceId}/apps/${slug}`}
                >
                  <a>
                    <ListItem
                      title={slug}
                      content={appName}
                      rightContent={
                        widgets.setup ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setup(slug);
                            }}
                            className="hover:text-accent"
                          >
                            <SettingOutlined />
                          </button>
                        ) : undefined
                      }
                    />
                  </a>
                </Link>
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
