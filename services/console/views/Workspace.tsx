import { Row, Col, MenuTab } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { EventsViewer } from '../components/EventsViewer';
import getLayout, { useWorkspace } from '../layouts/WorkspaceLayout';
import AutomationsSidebar from './AutomationsSidebar';
import WorkspaceSource from './WorkspaceSource';
import SidePanel from '../layouts/SidePanel';
import IconApps from '../icons/icon-apps.svgr';
import IconAutomations from '../icons/icon-automations.svgr';
import IconPages from '../icons/icon-pages.svgr';
import AppsSidebar from './AppsSidebar';
import PagesSidebar from './PagesSidebar';

export const Workspace = () => {
  const { t } = useTranslation('workspaces');
  const { displaySource, workspace } = useWorkspace();
  const [mountSourceComponent, setMountComponent] = useState(false);
  const [displaySourceView, setDisplaySourceView] = useState(false);
  const [sidebar, setSidebar] = useState('automations');

  useEffect(() => {
    if (displaySource) {
      setMountComponent(true);
    } else {
      setDisplaySourceView(false);
      setTimeout(() => setMountComponent(false), 200);
    }
  }, [displaySource]);

  const menu = useMemo(
    () => [
      {
        label: (
          <div className="flex items-center">
            <div className="flex mr-1">
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
            <div className="flex mr-1">
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
            <div className="flex mr-1">
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

  if (!workspace) return null;

  return (
    <>
      <div
        className={`
          absolute top-[75px] bottom-0 right-0 left-0
          bg-white
          flex flex-1
          transition-transform
          transition-duration-200
          transition-ease-in
          z-10
          ${displaySourceView ? '' : '-translate-y-full'}
        `}
      >
        {mountSourceComponent && (
          <WorkspaceSource onLoad={() => setDisplaySourceView(true)} />
        )}
      </div>

      <Row className="h-full">
        <Col span={16} className="flex h-full">
          <EventsViewer />
        </Col>
        <Col span={8} className="flex h-full">
          <SidePanel
            Header={
              <MenuTab
                items={menu}
                selected={
                  (menu.find(({ key }) => sidebar === key) || menu[0]).key
                }
                onSelect={setSidebar}
              />
            }
          >
            <>
              {sidebar === 'apps' && <AppsSidebar />}
              {sidebar === 'automations' && <AutomationsSidebar />}
              {sidebar === 'pages' && <PagesSidebar />}
            </>
          </SidePanel>
        </Col>
      </Row>
    </>
  );
};

Workspace.getLayout = getLayout;

export default Workspace;
