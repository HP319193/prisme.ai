import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import {
  Button,
  Col,
  Layout,
  MenuTab,
  Row,
  SidePanel,
  Tooltip,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import HeaderWorkspace from '../../components/HeaderWorkspace';
import WorkspaceSource from '../../views/WorkspaceSource';
import { useWorkspace } from '../../components/WorkspaceProvider';
import workspaceLayoutContext, { WorkspaceLayoutContext } from './context';
import useLocalizedText from '../../utils/useLocalizedText';
import { DoubleLeftOutlined, DoubleRightOutlined } from '@ant-design/icons';
import AppsSidebar from '../../views/AppsSidebar';
import AutomationsSidebar from '../../views/AutomationsSidebar';
import PagesSidebar from '../../views/PagesSidebar';
import Storage from '../../utils/Storage';
import IconApps from '../../icons/icon-apps.svgr';
import IconAutomations from '../../icons/icon-automations.svgr';
import IconPages from '../../icons/icon-pages.svgr';

export const WorkspaceLayout: FC = ({ children }) => {
  const { workspace } = useWorkspace();
  const { localize } = useLocalizedText();
  const { t } = useTranslation('workspaces');

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

  useEffect(() => {
    Storage.set('__workpaceSidebar', sidebar);
  }, [sidebar]);

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
        <Row className="h-full">
          <Col span={8} className="flex h-full">
            <SidePanel
              variant="squared"
              className={`
                z-10 absolute top-0 left-0 bottom-0 !bg-white
                ${fullSidebar ? 'w-[90vw] drop-shadow' : 'w-full'}
                transition-all ease-in duration-200`}
              Header={
                <div className="flex flex-row items-center h-[70px] justify-between border border-gray-200 border-solid !border-t-0">
                  <MenuTab
                    items={menu}
                    selected={
                      (menu.find(({ key }) => sidebar === key) || menu[0]).key
                    }
                    onSelect={setSidebar}
                  />
                  <Tooltip
                    title={t(
                      fullSidebar
                        ? 'workspace.collapseSidebar'
                        : 'workspace.expandSidebar'
                    )}
                    placement="left"
                  >
                    <Button
                      onClick={() => setFullSidebar(!fullSidebar)}
                      className="!text-sm"
                    >
                      {fullSidebar ? (
                        <DoubleLeftOutlined
                          className="color-blue"
                          alt="workspace.expandSidebar"
                        />
                      ) : (
                        <DoubleRightOutlined
                          className="color-blue"
                          alt="workspace.collapseSidebar"
                        />
                      )}
                    </Button>
                  </Tooltip>
                </div>
              }
            >
              <>
                {sidebar === 'apps' && <AppsSidebar />}
                {sidebar === 'automations' && <AutomationsSidebar />}
                {sidebar === 'pages' && <PagesSidebar />}
              </>
            </SidePanel>
          </Col>
          <Col span={16} className="flex h-full flex-col">
            {children}
          </Col>
        </Row>
      </Layout>
    </workspaceLayoutContext.Provider>
  );
};

export default WorkspaceLayout;
