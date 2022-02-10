import { SidePanel, Row, Col, MenuTab } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { EventsViewer } from '../components/EventsViewer';
import getLayout, { useWorkspace } from '../layouts/WorkspaceLayout';
import AutomationsSidebar from './AutomationsSidebar';
import WorkspaceSource from './WorkspaceSource';

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
      //{ label: t('apps.link'), key: 'apps' },
      { label: t('automations.link'), key: 'automations' },
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
              {sidebar === 'apps' && <div>Apps</div>}
              {sidebar === 'automations' && <AutomationsSidebar />}
            </>
          </SidePanel>
        </Col>
      </Row>
    </>
  );
};

Workspace.getLayout = getLayout;

export default Workspace;
