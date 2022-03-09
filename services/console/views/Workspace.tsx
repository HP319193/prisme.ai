import { Col, MenuTab, Row, SidePanel } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useMemo, useState } from 'react';
import { EventsViewer } from '../components/EventsViewer';
import getLayout, { useWorkspace } from '../layouts/WorkspaceLayout';
import AutomationsSidebar from './AutomationsSidebar';
import IconApps from '../icons/icon-apps.svgr';
import IconAutomations from '../icons/icon-automations.svgr';
import IconPages from '../icons/icon-pages.svgr';
import AppsSidebar from './AppsSidebar';
import PagesSidebar from './PagesSidebar';

export const Workspace = () => {
  const { t } = useTranslation('workspaces');
  const { workspace, fullSidebar } = useWorkspace();
  const [sidebar, setSidebar] = useState('automations');

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
      <Row className="h-full">
        <Col span={14} className="flex h-full">
          <EventsViewer />
        </Col>
        <Col span={10} className="flex h-full">
          <SidePanel
            className={`
            absolute top-0 right-0 bottom-0 !bg-white
            ${fullSidebar ? 'w-[90vw] drop-shadow' : 'w-full'}
            transition-all ease-in duration-200`}
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
