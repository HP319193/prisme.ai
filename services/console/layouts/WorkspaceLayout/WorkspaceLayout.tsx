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
import IconApps from '../../icons/icon-apps.svgr';
import IconAutomations from '../../icons/icon-automations.svgr';
import IconPages from '../../icons/icon-pages.svgr';
import { appInstanceWithSlug, useApps } from '../../components/AppsProvider';
import usePages from '../../components/PagesProvider/context';
import AppsStore from '../../views/AppsStore';

const TREE_CONTENT_TYPE = {
  automation: 'automation',
  page: 'page',
  app: 'app',
  activity: 'activity',
};

export const WorkspaceLayout: FC = ({ children }) => {
  const { workspace } = useWorkspace();
  const { appInstances, getAppInstances } = useApps();
  const { pages, createPage } = usePages();
  const router = useRouter();

  const { localize } = useLocalizedText();
  const {
    t,
    i18n: { language },
  } = useTranslation('workspaces');

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

  const menu = useMemo(
    () => [
      {
        label: (
          <div className="flex items-center">
            <div className="flex mr-2">
              <IconApps width={16} height={16} />
            </div>
            {t('apps.link')}
          </div>
        ),
        key: 'apps',
      },
      {
        label: (
          <div className="flex items-center">
            <div className="flex mr-2">
              <IconAutomations width={16} height={16} />
            </div>
            {t('automations.link')}
          </div>
        ),
        key: 'automations',
      },
      {
        label: (
          <div className="flex items-center">
            <div className="flex mr-2">
              <IconPages width={16} height={16} />
            </div>
            {t('pages.link')}
          </div>
        ),
        key: 'pages',
      },
    ],
    [t]
  );

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
        case TREE_CONTENT_TYPE.automation: {
          router.push(`/workspaces/${workspace.id}/automations/${slug}`);
          break;
        }
        case TREE_CONTENT_TYPE.page: {
          router.push(`/workspaces/${workspace.id}/pages/${slug}`);
          break;
        }
        case TREE_CONTENT_TYPE.app: {
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

  // TODO refacto in hook
  const { createAutomation } = useWorkspace();

  // const [creating, setCreating] = useState(false);

  const generateAutomationName = useCallback(() => {
    const defaultName = t('automations.create.defaultName');
    let version = 0;
    const generateName = () =>
      `${defaultName}${version ? ` (${version})` : ''}`;
    const names = Object.keys(workspace.automations || {}).map((key) =>
      localize(workspace.automations?.[key]?.name)
    );
    while (names.find((name) => name === generateName())) {
      version++;
    }
    return generateName();
  }, [workspace.automations, localize, t]);

  const onCreateAutomation = useCallback(
    async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.stopPropagation();

      setCreating(true);

      const name = generateAutomationName();
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
    [generateAutomationName, createAutomation, router, workspace.id]
  );

  // Todo centraliser le generatename

  const [creating, setCreating] = useState(false);
  const generatePageName = useCallback(() => {
    const defaultName = t('pages.create.defaultName');
    let version = 0;
    const generateName = () =>
      `${defaultName}${version ? ` (${version})` : ''}`;
    const names = currentPages.map(({ name }) => {
      return localize(name);
    });
    while (names.find((name) => name === generateName())) {
      version++;
    }
    return generateName();
  }, [currentPages, localize, t]);

  const onCreatePage = useCallback(async () => {
    setCreating(true);

    const name = generatePageName();
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
  }, [generatePageName, createPage, workspace, language, router]);

  // i18n nom des categories
  const treeData = useMemo(
    () => [
      {
        title: 'Activity',
        key: `${TREE_CONTENT_TYPE.activity}:activity`,
        selectable: false,
      },
      {
        onAdd: onCreateAutomation,
        title: 'Automations',
        key: 'Automations',
        selectable: false,
        children: (Object.entries(workspace.automations || {}) || []).map(
          ([slug, automation]) => ({
            title: automation.name,
            key: `${TREE_CONTENT_TYPE.automation}:${slug}`,
          })
        ),
      },
      {
        onAdd: onCreatePage,
        title: 'Pages',
        key: 'Pages',
        selectable: false,
        children: (currentPages || []).map((page) => ({
          title: localize(page.name),
          key: `${TREE_CONTENT_TYPE.page}:${page.id}`,
        })),
      },
      {
        onAdd: () => setAppStoreVisible(true),
        title: 'Apps',
        key: 'Apps',
        selectable: false,
        children: (workspaceAppInstances || []).map((appInstance) => ({
          title: `${appInstance.appName}`,
          key: `${TREE_CONTENT_TYPE.app}:${appInstance.slug}`,
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

  console.log('workspaceAppInstances', workspaceAppInstances);

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
          <SidePanel
            variant="squared"
            className={`min-w-xs max-w-xs`}
            // Header={
            //   <div className="flex flex-row items-center h-[70px] justify-between border border-gray-200 border-solid !border-t-0">
            //     <Tooltip
            //       title={t(
            //         fullSidebar
            //           ? 'workspace.collapseSidebar'
            //           : 'workspace.expandSidebar'
            //       )}
            //       placement="left"
            //     >
            //       <Button
            //         onClick={() => setFullSidebar(!fullSidebar)}
            //         className="!text-sm"
            //       >
            //         {fullSidebar ? (
            //           <DoubleLeftOutlined
            //             className="color-blue"
            //             alt="workspace.expandSidebar"
            //           />
            //         ) : (
            //           <DoubleRightOutlined
            //             className="color-blue"
            //             alt="workspace.collapseSidebar"
            //           />
            //         )}
            //       </Button>
            //     </Tooltip>
            //   </div>
            // }
          >
            <Tree defaultExpandAll={true} onSelect={onSelect} data={treeData} />
          </SidePanel>
          <div className="flex h-full flex-col flex-1">{children}</div>
        </div>
      </Layout>
    </workspaceLayoutContext.Provider>
  );
};

export default WorkspaceLayout;
