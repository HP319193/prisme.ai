import React, { FC, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout, Loading, notification } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import HeaderWorkspace from '../../components/HeaderWorkspace/HeaderWorkspace';
import WorkspaceSource from '../../views/WorkspaceSource';
import workspaceLayoutContext, {
  DisplayedSourceType,
  WorkspaceLayoutContext,
} from './context';
import useLocalizedText from '../../utils/useLocalizedText';
import Storage from '../../utils/Storage';
import AppsStore from '../../views/AppsStore';
import Navigation from './Navigation';
import { useWorkspace } from '../../providers/Workspace';
import Expand from '../../components/Navigation/Expand';
import { incrementName } from '../../utils/incrementName';
import { BlocksProvider } from '../../components/BlocksProvider';
import api, { ApiError } from '../../utils/api';
import Tabs from './Tabs';
import { TrackingCategory, useTracking } from '../../components/Tracking';
import { usePermissions } from '../../components/PermissionsProvider';
import WorkspaceBlocksProvider from '../../providers/WorkspaceBlocksProvider';

export const WorkspaceLayout: FC = ({ children }) => {
  const {
    workspace,
    saveWorkspace,
    createAutomation,
    creatingAutomation,
    createPage,
    creatingPage,
    createBlock,
  } = useWorkspace();

  const router = useRouter();

  const { localize } = useLocalizedText();
  const {
    t,
    i18n: { language },
  } = useTranslation('workspaces');

  const [sourceDisplayed, setSourceDisplayed] = useState(
    DisplayedSourceType.None
  );
  const [mountSourceComponent, setMountComponent] = useState(false);
  const [displaySourceView, setDisplaySourceView] = useState(false);
  const [invalid, setInvalid] =
    useState<WorkspaceLayoutContext['invalid']>(false);
  const [newSource, setNewSource] =
    useState<WorkspaceLayoutContext['newSource']>();
  const [saving, setSaving] = useState(false);
  const [fullSidebar, setFullSidebar] = useState(
    Storage.get('__workpaceSidebarMinimized') === null
      ? window.innerWidth > 500
      : !Storage.get('__workpaceSidebarMinimized')
  );

  const [appStoreVisible, setAppStoreVisible] = useState(false);
  const { trackEvent } = useTracking();
  const { addUserPermissions } = usePermissions();

  useEffect(() => {
    if (fullSidebar) {
      Storage.set('__workpaceSidebarMinimized', 0);
    } else {
      Storage.set('__workpaceSidebarMinimized', 1);
    }
  }, [fullSidebar]);

  // Manage source panel display
  useEffect(() => {
    if (sourceDisplayed !== DisplayedSourceType.None) {
      setMountComponent(true);
    } else {
      setDisplaySourceView(false);
      setTimeout(() => setMountComponent(false), 200);
    }
  }, [sourceDisplayed]);

  const onSaveSource = useCallback(async () => {
    trackEvent({
      category: 'Workspace',
      name: 'Save source code',
      action: 'click',
    });
    if (!newSource) return;

    setSaving(true);
    try {
      if (sourceDisplayed === DisplayedSourceType.Config) {
        await saveWorkspace(newSource);
      } else if (sourceDisplayed === DisplayedSourceType.Roles) {
        delete (newSource as any).id;
        await api.updateWorkspaceSecurity(
          workspace.id,
          newSource as Prismeai.WorkspaceSecurity
        );
      }
      notification.success({
        message: t('expert.save.confirm'),
        placement: 'bottomRight',
      });
    } catch (e) {
      const { details, message } = e as ApiError;
      const description = Array.isArray(details) ? (
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
      ) : (
        message
      );
      notification.error({
        message: t('expert.save.fail'),
        description,
        placement: 'bottomRight',
      });
    }
    setSaving(false);
  }, [newSource, saveWorkspace, sourceDisplayed, t, trackEvent, workspace.id]);

  const onSave = useCallback(
    async (workspace: Prismeai.Workspace) => {
      trackEvent({
        category: 'Workspace',
        name: 'Save Workspace',
        action: 'click',
      });
      setSaving(true);
      await saveWorkspace(workspace);
      notification.success({
        message: t('save.confirm'),
        placement: 'bottomRight',
      });
      setSaving(false);
    },
    [saveWorkspace, t, trackEvent]
  );

  const displaySource = useCallback(
    (v: DisplayedSourceType) => {
      trackEvent({
        category: 'Workspace',
        name: `${v ? 'Hide' : 'Display'} source code`,
        action: 'click',
      });
      setSourceDisplayed(v);
    },
    [trackEvent]
  );

  const createAutomationHandler = useCallback(async () => {
    trackEvent({
      category: 'Workspace',
      name: 'Create Automation from navigation',
      action: 'click',
    });
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
    trackEvent,
    workspace.automations,
    workspace.id,
  ]);

  const createPageHandler: WorkspaceLayoutContext['createPage'] = useCallback(
    async ({ slug, public: isPublic, ...page } = {}) => {
      trackEvent({
        category: 'Workspace',
        name: slug
          ? 'Create Page template from navigation'
          : 'Create Page from navigation',
        action: 'click',
      });
      const name = slug
        ? t(`pages.create.template.${slug}`)
        : incrementName(
            t(`pages.create.defaultName`),
            Object.values(workspace.pages || {}).map(({ name }) =>
              localize(name)
            )
          );
      const createdPage = await createPage({
        name: {
          [language]: name,
        },
        slug,
        blocks: [],
        ...page,
      });
      if (isPublic && createdPage && createdPage.id) {
        await addUserPermissions('pages', createdPage.id, {
          target: { public: true },
          permissions: {
            policies: { read: true },
          },
        });
      }
      if (createdPage) {
        await router.push(
          `/workspaces/${workspace.id}/pages/${createdPage.slug}`
        );
      }
    },
    [
      addUserPermissions,
      createPage,
      language,
      localize,
      router,
      t,
      trackEvent,
      workspace.id,
      workspace.pages,
    ]
  );

  const installAppHandler = useCallback(() => {
    setAppStoreVisible(true);
    trackEvent({
      category: 'Workspace',
      name: 'Display Apps catalog from navigation',
      action: 'click',
    });
  }, [trackEvent]);

  const createBlockHandler = useCallback(async () => {
    trackEvent({
      category: 'Workspace',
      name: 'Create Block from navigation',
      action: 'click',
    });
    const name = incrementName(
      t(`blocks.create.defaultName`),
      Object.values(workspace.blocks || {}).map(({ name }) => localize(name))
    );
    const createdBlock = await createBlock({ slug: name, name, blocks: [] });
    if (createdBlock) {
      await router.push(`/workspaces/${workspace.id}/blocks/${name}`);
    }
  }, [
    createBlock,
    localize,
    router,
    t,
    trackEvent,
    workspace.blocks,
    workspace.id,
  ]);

  return (
    <TrackingCategory category="Workspace">
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
          createBlock: createBlockHandler,
          installApp: installAppHandler,
        }}
      >
        <BlocksProvider>
          <WorkspaceBlocksProvider>
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
          absolute top-[72px] bottom-0 right-0 left-0
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
                <WorkspaceSource
                  key={sourceDisplayed}
                  sourceDisplayed={sourceDisplayed}
                  onLoad={() => setDisplaySourceView(true)}
                />
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
                  <div className="flex w-full h-full border-r border-gray-200 border-solid flex-col justify-between overflow-hidden onboarding-step-4">
                    <Navigation
                      onCreateAutomation={() => createAutomationHandler()}
                      onCreatePage={() => createPageHandler()}
                      onInstallApp={() => installAppHandler()}
                      onCreateBlock={() => createBlockHandler()}
                      onExpand={() => setFullSidebar(true)}
                      className="max-h-[calc(100%-3rem)]"
                    />
                    <Expand
                      expanded={fullSidebar}
                      onToggle={() => {
                        trackEvent({
                          name: `${
                            fullSidebar ? 'Minimize' : 'Expand'
                          } sidebar`,
                          action: 'click',
                        });
                        setFullSidebar(!fullSidebar);
                      }}
                    />
                  </div>
                </Layout>
                <div className="flex h-full flex-col flex-1 min-w-[1px] max-w-full onboarding-step-5">
                  <Tabs />
                  {creatingAutomation || creatingPage ? <Loading /> : children}
                </div>
              </div>
            </Layout>
          </WorkspaceBlocksProvider>
        </BlocksProvider>
      </workspaceLayoutContext.Provider>
    </TrackingCategory>
  );
};

export default WorkspaceLayout;
