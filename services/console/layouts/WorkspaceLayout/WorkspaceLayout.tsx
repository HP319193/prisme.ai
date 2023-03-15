import React, { FC, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout, Loading, notification } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import HeaderWorkspace from '../../components/HeaderWorkspace';
import WorkspaceSource from '../../views/WorkspaceSource';
import workspaceLayoutContext, { WorkspaceLayoutContext } from './context';
import useLocalizedText from '../../utils/useLocalizedText';
import Storage from '../../utils/Storage';
import AppsStore from '../../views/AppsStore';
import Navigation from './Navigation';
import { useWorkspace } from '../../providers/Workspace';
import Expand from '../../components/Navigation/Expand';
import { incrementName } from '../../utils/incrementName';
import { BlocksProvider } from '../../components/BlocksProvider';
import { ApiError } from '../../utils/api';
import Tabs from './Tabs';

export const WorkspaceLayout: FC = ({ children }) => {
  const {
    workspace,
    saveWorkspace,
    createAutomation,
    creatingAutomation,
    createPage,
    creatingPage,
  } = useWorkspace();

  const router = useRouter();

  const { localize } = useLocalizedText();
  const {
    t,
    i18n: { language },
  } = useTranslation('workspaces');

  const [sourceDisplayed, setSourceDisplayed] = useState(false);
  const [mountSourceComponent, setMountComponent] = useState(false);
  const [displaySourceView, setDisplaySourceView] = useState(false);
  const [invalid, setInvalid] = useState<WorkspaceLayoutContext['invalid']>(
    false
  );
  const [newSource, setNewSource] = useState<
    WorkspaceLayoutContext['newSource']
  >();
  const [saving, setSaving] = useState(false);
  const [fullSidebar, setFullSidebar] = useState(
    !Storage.get('__workpaceSidebarMinimized')
  );
  const [appStoreVisible, setAppStoreVisible] = useState(false);

  useEffect(() => {
    if (fullSidebar) {
      Storage.set('__workpaceSidebarMinimized', 0);
    } else {
      Storage.set('__workpaceSidebarMinimized', 1);
    }
  }, [fullSidebar]);

  // Manage source panel display
  useEffect(() => {
    if (sourceDisplayed) {
      setMountComponent(true);
    } else {
      setDisplaySourceView(false);
      setTimeout(() => setMountComponent(false), 200);
    }
  }, [sourceDisplayed]);

  const onSaveSource = useCallback(async () => {
    if (!newSource) return;

    setSaving(true);
    try {
      await saveWorkspace(newSource);
      notification.success({
        message: t('expert.save.confirm'),
        placement: 'bottomRight',
      });
    } catch (e) {
      const { details } = e as ApiError;
      const description = (
        <ul>
          {details.map(({ path, message }: any, key: number) => (
            <li key={key}>
              {t('openapi', {
                context: message,
                path: path.replace(/^\.body\./, ''),
                ns: 'errors',
              })}
            </li>
          ))}
        </ul>
      );
      notification.error({
        message: t('expert.save.fail'),
        description,
        placement: 'bottomRight',
      });
    }
    setSaving(false);
  }, [newSource, saveWorkspace, t]);

  const onSave = useCallback(
    async (workspace: Prismeai.Workspace) => {
      setSaving(true);
      await saveWorkspace(workspace);
      notification.success({
        message: t('save.confirm'),
        placement: 'bottomRight',
      });
      setSaving(false);
    },
    [saveWorkspace, t]
  );

  const displaySource = useCallback((v: boolean) => {
    setSourceDisplayed(v);
  }, []);

  const createAutomationHandler = useCallback(async () => {
    const name = incrementName(
      t(`automations.create.defaultName`),
      Object.values(workspace.automations || {}).map(({ name }) =>
        localize(name)
      )
    );
    const createdAutomation = await createAutomation({
      name,
      do: [],
    });
    if (createdAutomation) {
      await router.push(
        `/workspaces/${workspace.id}/automations/${createdAutomation.slug}`
      );
    }
  }, [
    createAutomation,
    localize,
    router,
    t,
    workspace.automations,
    workspace.id,
  ]);

  const createPageHandler = useCallback(async () => {
    const name = incrementName(
      t(`pages.create.defaultName`),
      Object.values(workspace.pages || {}).map(({ name }) => localize(name))
    );
    const createdPage = await createPage({
      name: {
        [language]: name,
      },
      blocks: [],
    });
    if (createdPage) {
      await router.push(
        `/workspaces/${workspace.id}/pages/${createdPage.slug}`
      );
    }
  }, [
    createPage,
    language,
    localize,
    router,
    t,
    workspace.id,
    workspace.pages,
  ]);

  const installAppHandler = useCallback(() => setAppStoreVisible(true), []);

  return (
    <workspaceLayoutContext.Provider
      value={{
        displaySource,
        sourceDisplayed,
        saving,
        setSaving,
        onSave,
        onSaveSource,
        invalid,
        setInvalid,
        newSource,
        setNewSource,
        fullSidebar,
        setFullSidebar,
        createAutomation: createAutomationHandler,
        createPage: createPageHandler,
        installApp: installAppHandler,
      }}
    >
      <BlocksProvider>
        <Head>
          <title>
            {t('workspace.title', { name: localize(workspace.name) })}
          </title>
          <meta
            name="description"
            content={t('workspace.description', {
              name: localize(workspace.name),
            })}
          />
        </Head>
        <div
          className={`
          absolute top-[75px] bottom-0 right-0 left-0
          bg-white
          flex flex-1
          transition-transform
          transition-duration-200
          transition-ease-in
          z-20
          ${displaySourceView ? '' : '-translate-y-full'}
        `}
        >
          {mountSourceComponent && (
            <WorkspaceSource onLoad={() => setDisplaySourceView(true)} />
          )}
        </div>
        <Layout Header={<HeaderWorkspace />} className="max-w-full">
          <AppsStore
            visible={appStoreVisible}
            onCancel={() => setAppStoreVisible(false)}
          />
          <div className="h-full flex flex-row">
            <Layout
              className={`${
                fullSidebar ? 'max-w-xs' : 'max-w-[4.2rem]'
              } transition-all p-0`}
            >
              <div className="flex w-full h-full border-r border-gray-200 border-solid flex-col justify-between overflow-hidden">
                <Navigation
                  onCreateAutomation={createAutomationHandler}
                  onCreatePage={createPageHandler}
                  onInstallApp={installAppHandler}
                  onExpand={() => setFullSidebar(true)}
                  className="max-h-[calc(100%-3rem)]"
                />
                <Expand
                  expanded={fullSidebar}
                  onToggle={() => setFullSidebar(!fullSidebar)}
                />
              </div>
            </Layout>
            <div className="flex h-full flex-col flex-1 min-w-[1px] max-w-full">
              <Tabs />
              {creatingAutomation || creatingPage ? <Loading /> : children}
            </div>
          </div>
        </Layout>
      </BlocksProvider>
    </workspaceLayoutContext.Provider>
  );
};

export default WorkspaceLayout;
