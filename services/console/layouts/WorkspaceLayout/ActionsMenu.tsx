import { AppstoreAddOutlined, LoadingOutlined } from '@ant-design/icons';
import { Dropdown } from '@prisme.ai/design-system';
import { Menu } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useTranslation } from 'next-i18next';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import PublishModal from '../../components/PublishModal';
import { useTracking } from '../../components/Tracking';
import VersionModal from '../../components/VersionModal';
import { useWorkspace } from '../../providers/Workspace';
import api from '../../utils/api';
import { DisplayedSourceType, useWorkspaceLayout } from './context';
import CodeIcon from '/icons/code.svgr';
import ExportIcon from '/icons/export.svgr';
import TagIcon from '/icons/tag.svgr';
import UsersIcon from '/icons/users.svgr';

interface ActionsMenuProps {
  children: ReactNode;
  className?: string;
}

export const ActionsMenu = ({ children, className }: ActionsMenuProps) => {
  const { workspace } = useWorkspace();
  const { t } = useTranslation('workspaces');
  const { trackEvent } = useTracking();

  const { displaySource, sourceDisplayed } = useWorkspaceLayout();
  const [exporting, setExporting] = useState(false);
  const [publishVisible, setPublishVisible] = useState(false);
  const [versionVisible, setVersionVisible] = useState(false);

  const onDisplaySource = useCallback(() => {
    trackEvent({
      name: 'Display Source from Details',
      action: 'click',
    });
    displaySource(
      sourceDisplayed === DisplayedSourceType.Config
        ? DisplayedSourceType.None
        : DisplayedSourceType.Config
    );
  }, [displaySource, sourceDisplayed, trackEvent]);

  const onDisplayRoles = useCallback(() => {
    trackEvent({
      name: 'Display Roles Edition',
      action: 'click',
    });
    displaySource(
      sourceDisplayed === DisplayedSourceType.Roles
        ? DisplayedSourceType.None
        : DisplayedSourceType.Roles
    );
  }, [displaySource, sourceDisplayed, trackEvent]);

  const onPublishAsApp = useCallback(() => {
    trackEvent({
      name: 'Display Publish as App Modal',
      action: 'click',
    });
    setPublishVisible(true);
  }, [trackEvent]);

  const onVersion = useCallback(() => {
    trackEvent({
      name: 'Display Versionning Modal',
      action: 'click',
    });
    setVersionVisible(true);
  }, [trackEvent]);

  const onExport = useCallback(async () => {
    trackEvent({
      name: 'Export',
      action: 'click',
    });
    if (exporting) return;
    setExporting(true);
    const zip = await api.workspaces(workspace.id).versions.export();
    const a = document.createElement('a');
    a.style.display = 'none';
    a.setAttribute('download', `workspace-${workspace.id}.zip`);
    a.setAttribute('href', URL.createObjectURL(zip));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setExporting(false);
  }, [exporting, trackEvent, workspace.id]);

  const menu: ItemType[] = useMemo(
    () => [
      {
        key: 'editSource',
        label: (
          <button
            onClick={onDisplaySource}
            className="flex flex-row items-center"
          >
            <CodeIcon className="mr-2" />
            {t(`expert.show`)}
          </button>
        ),
      },
      {
        key: 'editSource',
        label: (
          <button
            onClick={onDisplayRoles}
            className="flex flex-row items-center"
          >
            <UsersIcon className="mr-2" />
            {t(`expert.security`)}
          </button>
        ),
      },
      { type: 'divider' },
      {
        key: 'publishApp',
        label: (
          <button
            onClick={onPublishAsApp}
            className="flex flex-row items-center"
          >
            <AppstoreAddOutlined className="mr-2" />
            {t(`apps.publish.menuLabel`)}
          </button>
        ),
      },
      {
        key: 'version',
        label: (
          <button onClick={onVersion} className="flex flex-row items-center">
            <TagIcon className="mr-2" />
            {t(`workspace.versions.create.label`)}
          </button>
        ),
      },
      {
        key: 'export',
        label: (
          <button onClick={onExport} className="flex flex-row items-center">
            {exporting ? (
              <LoadingOutlined className="mr-2" />
            ) : (
              <ExportIcon className="mr-2" />
            )}
            {t(`workspace.versions.export.label`)}
          </button>
        ),
      },
    ],
    []
  );
  return (
    <>
      <PublishModal
        visible={publishVisible}
        close={() => setPublishVisible(false)}
      />
      <VersionModal
        visible={versionVisible}
        close={() => setVersionVisible(false)}
      />
      <Dropdown
        Menu={<Menu items={menu} />}
        placement="bottomLeft"
        trigger={['click']}
        className={className}
      >
        <>{children}</>
      </Dropdown>
    </>
  );
};

export default ActionsMenu;