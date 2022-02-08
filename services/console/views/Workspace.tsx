import { SidePanel, Row, Col, MenuTab } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EventsViewer } from '../components/EventsViewer';
import getLayout, { useWorkspace } from '../layouts/WorkspaceLayout';
import AutomationsSidebar from './AutomationsSidebar';
import WorkspaceSource from './WorkspaceSource';

export const Workspace = () => {
  const { t } = useTranslation('workspaces');
  const { displaySource } = useWorkspace();
  const [mountSourceComponent, setMountComponent] = useState(false);
  const [displaySourceView, setDisplaySourceView] = useState(false);
  const [sidebar, setSidebar] = useState('automations');

  const displayAutomations = useCallback(() => {
    setTimeout(() => {
      if (sidebar === 'automations') return;
      setSidebar('automations');
    }, 200);
  }, [sidebar]);

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
      { label: t('apps.link'), key: 'apps' },
      { label: t('automations.link'), key: 'automations' },
    ],
    [t]
  );

  return (
    <>
      <div
        className={`
          absolute top-0 bottom-0 right-0 left-0
          flex flex-1
          drop-shadow-md
          transition-transform
          transition-duration-200
          transition-ease-in
          z-1
          ${displaySourceView ? '' : '-translate-y-100'}
        `}
      >
        {mountSourceComponent && (
          <WorkspaceSource onLoad={() => setDisplaySourceView(true)} />
        )}
      </div>

      <Row className="grow">
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
