import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout, SidePanel, Tree } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import HeaderWorkspace from '../../components/HeaderWorkspace';
import WorkspaceSource from '../../views/WorkspaceSource';
import { useWorkspace } from '../../components/WorkspaceProvider';
import workspaceLayoutContext, { WorkspaceLayoutContext } from './context';
import useLocalizedText from '../../utils/useLocalizedText';
import Storage from '../../utils/Storage';
import { appInstanceWithSlug, useApps } from '../../components/AppsProvider';
import usePages from '../../components/PagesProvider/context';
import AppsStore from '../../views/AppsStore';
import { generateNewName } from '../../utils/generateNewName';

const TREE_CONTENT_TYPE = {
  automations: 'automations',
  pages: 'pages',
  apps: 'apps',
  activity: 'activity',
};
type TREE_CONTENT_TYPE_Keys = keyof typeof TREE_CONTENT_TYPE;

export const WorkspaceLayout: FC = ({ children }) => {
  const { workspace, createAutomation } = useWorkspace();
  const { appInstances, getAppInstances } = useApps();
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
  const [invalid, setInvalid] =
    useState<WorkspaceLayoutContext['invalid']>(false);
  const [newSource, setNewSource] =
    useState<WorkspaceLayoutContext['newSource']>();
  const [saving, setSaving] = useState(false);
  const [fullSidebar, setFullSidebar] = useState(false);
  const [sidebar, setSidebar] = useState(
    Storage.get('__workpaceSidebar') || 'automations'
  );
  const [appStoreVisible, setAppStoreVisible] = useState(false);

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

  const displaySource = useCallback((v: boolean) => {
    setSourceDisplayed(v);
  }, []);

  const onSelect = useCallback(
    (selectedKey, _) => {
      if (!selectedKey || !selectedKey[0] || selectedKey[0].indexOf(':') === -1)
        return;
      const [type, slug] = selectedKey[0].split(':');
      switch (type) {
        case TREE_CONTENT_TYPE.activity: {
          router.push(`/workspaces/${workspace.id}/`);
          break;
        }
        case TREE_CONTENT_TYPE.automations: {
          router.push(`/workspaces/${workspace.id}/automations/${slug}`);
          break;
        }
        case TREE_CONTENT_TYPE.pages: {
          router.push(`/workspaces/${workspace.id}/pages/${slug}`);
          break;
        }
        case TREE_CONTENT_TYPE.apps: {
          router.push(`/workspaces/${workspace.id}/apps/${slug}`);
          break;
        }
      }
    },
    [router, workspace.id]
  );

  const workspaceAppInstances = appInstances.get(
    workspace.id
  ) as appInstanceWithSlug[];

  const currentPages = useMemo(
    () => Array.from(pages.get(workspace.id) || []),
    [pages, workspace.id]
  );

  const onCreateAutomation = useCallback(
    async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();

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
    },
    [createAutomation, localize, router, t, workspace.automations, workspace.id]
  );

  const onCreatePage = useCallback(async () => {
    setCreating(true);

    const name = generateNewName(
      t(`pages.create.defaultName`),
      currentPages.map(({ name }) => name),
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
  }, [t, currentPages, localize, createPage, workspace.id, language, router]);

  // i18n nom des categories
  const treeData = useMemo(
    () => [
      {
        title: 'Activity',
        key: `${TREE_CONTENT_TYPE.activity}:activity`,
        selectable: false,
        alwaysShown: true,
      },
      {
        onAdd: onCreateAutomation,
        title: 'Automations',
        key: 'Automations',
        selectable: false,
        alwaysShown: true,
        children: (Object.entries(workspace.automations || {}) || []).map(
          ([slug, automation]) => ({
            title: localize(automation.name),
            key: `${TREE_CONTENT_TYPE.automations}:${slug}`,
          })
        ),
      },
      {
        onAdd: onCreatePage,
        title: 'Pages',
        key: 'Pages',
        selectable: false,
        alwaysShown: true,
        children: (currentPages || []).map((page) => ({
          title: localize(page.name),
          key: `${TREE_CONTENT_TYPE.pages}:${page.id}`,
        })),
      },
      {
        onAdd: () => setAppStoreVisible(true),
        title: 'Apps',
        key: 'Apps',
        selectable: false,
        alwaysShown: true,
        children: (workspaceAppInstances || []).map((appInstance) => ({
          title: `${appInstance.appName}`,
          key: `${TREE_CONTENT_TYPE.apps}:${appInstance.slug}`,
        })),
      },
    ],
    [
      currentPages,
      localize,
      onCreateAutomation,
      onCreatePage,
      workspace.automations,
      workspaceAppInstances,
    ]
  );

  return (
    <workspaceLayoutContext.Provider
      value={{
        displaySource,
        sourceDisplayed,
        saving,
        setSaving,
        invalid,
        setInvalid,
        newSource,
        setNewSource,
        fullSidebar,
        setFullSidebar,
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
            <div className="flex w-full overflow-auto">
              <Tree
                defaultExpandAll={true}
                onSelect={onSelect}
                data={treeData}
              />
            </div>
          </SidePanel>
          <div className="flex h-full flex-col flex-1">{children}</div>
        </div>
      </Layout>
    </workspaceLayoutContext.Provider>
  );
};

export default WorkspaceLayout;
