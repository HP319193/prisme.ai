import React, { FC, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Layout,
  Loading,
  notification,
  SidePanel,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import HeaderWorkspace from '../../components/HeaderWorkspace';
import WorkspaceSource from '../../views/WorkspaceSource';
import { useWorkspace } from '../../components/WorkspaceProvider';
import workspaceLayoutContext, { WorkspaceLayoutContext } from './context';
import useLocalizedText from '../../utils/useLocalizedText';
import Storage from '../../utils/Storage';
import { useApps } from '../../components/AppsProvider';
import usePages from '../../components/PagesProvider/context';
import AppsStore from '../../views/AppsStore';
import { generateNewName } from '../../utils/generateNewName';
import { Workspace } from '@prisme.ai/sdk';
import Navigation from './Navigation';

export const WorkspaceLayout: FC = ({ children }) => {
  const { workspace, createAutomation, saveSource, save } = useWorkspace();
  const { getAppInstances } = useApps();
  const { pages, createPage } = usePages();
  const router = useRouter();

  const { localize } = useLocalizedText();
  const {
    t,
    i18n: { language },
  } = useTranslation('workspaces');

  const [creating, setCreating] = useState(false);
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
  const [fullSidebar, setFullSidebar] = useState(false);
  const [sidebar] = useState(Storage.get('__workpaceSidebar') || 'automations');
  const [appStoreVisible, setAppStoreVisible] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    Storage.set('__workpaceSidebar', sidebar);
  }, [sidebar]);

  useEffect(() => {
    getAppInstances(workspace.id);
  }, [getAppInstances, workspace]);

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
      await saveSource(newSource);
      notification.success({
        message: t('expert.save.confirm'),
        placement: 'bottomRight',
      });
    } catch {}
    setSaving(false);
  }, [newSource, saveSource, t]);

  const onSave = useCallback(
    async (workspace: Workspace) => {
      setSaving(true);
      try {
        await save(workspace);
        notification.success({
          message: t('save.confirm'),
          placement: 'bottomRight',
        });
      } catch {}
      setSaving(false);
    },
    [save, t]
  );

  const displaySource = useCallback((v: boolean) => {
    setSourceDisplayed(v);
  }, []);

  const createAutomationHandler = useCallback(async () => {
    setCreating(true);

    const name = generateNewName(
      t(`automations.create.defaultName`),
      Object.values(workspace.automations || {}).map(({ name }) => name),
      localize
    );
    const createdAutomation = await createAutomation({
      name,
      do: [],
    });

    setCreating(false);
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
    setCreating(true);

    const name = generateNewName(
      t(`pages.create.defaultName`),
      Array.from(pages.get(workspace.id) || []).map(({ name }) => name),
      localize
    );

    try {
      const createdPage = await createPage(workspace.id, {
        name: {
          [language]: name,
        },
        blocks: [],
      });

      if (createdPage) {
        await router.push(
          `/workspaces/${workspace.id}/pages/${createdPage.id}`
        );
      }
    } catch (e) {}
    setCreating(false);
  }, [t, pages, workspace.id, localize, createPage, language, router]);

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
        dirty,
        setDirty,
      }}
    >
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
          z-[11]
          ${displaySourceView ? '' : '-translate-y-full'}
        `}
      >
        {mountSourceComponent && (
          <WorkspaceSource onLoad={() => setDisplaySourceView(true)} />
        )}
      </div>
      <Layout Header={<HeaderWorkspace />}>
        <AppsStore
          visible={appStoreVisible}
          onCancel={() => setAppStoreVisible(false)}
        />
        <div className="h-full flex flex-row">
          <SidePanel variant="squared" className={`min-w-xs max-w-xs`}>
            <div className="flex w-full flex-col">
              <Navigation
                onCreateAutomation={createAutomationHandler}
                onCreatePage={createPageHandler}
                onInstallApp={installAppHandler}
              />
            </div>
          </SidePanel>
          <div className="flex h-full flex-col flex-1 min-w-[500px] max-w-[calc(100vw-20rem)]">
            {creating ? <Loading /> : children}
          </div>
        </div>
      </Layout>
    </workspaceLayoutContext.Provider>
  );
};

export default WorkspaceLayout;
