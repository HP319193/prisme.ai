import {
  AppstoreAddOutlined,
  KeyOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
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
import UsersIcon from '/icons/users.svgr';
import ArrowDown from '/icons/arrow-down.svgr';
import ArrowUp from '/icons/arrow-up.svgr';
import useLocalizedText from '../../utils/useLocalizedText';
import { kebabCase } from 'lodash';
import EditSecretsModal from '../../components/EditSecrets';

interface ActionsMenuProps {
  children: ReactNode;
  className?: string;
}

export const ActionsMenu = ({ children, className }: ActionsMenuProps) => {
  const { workspace } = useWorkspace();
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { trackEvent } = useTracking();
  const [isOpen, setIsOpen] = useState(false);

  const { displaySource, sourceDisplayed } = useWorkspaceLayout();
  const [exporting, setExporting] = useState(false);
  const [publishVisible, setPublishVisible] = useState(false);
  const [editSecretsVisible, setEditSecretsVisible] = useState(false);
  const [versionVisible, setVersionVisible] = useState<false | 'push' | 'pull'>(
    false
  );

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
    setIsOpen(false);
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
    setIsOpen(false);
    setPublishVisible(true);
  }, [trackEvent]);

  const onEditSecrets = useCallback(() => {
    trackEvent({
      name: 'Display edit secrets',
      action: 'click',
    });
    setIsOpen(false);
    setEditSecretsVisible(true);
  }, [trackEvent]);

  const onVersion = useCallback(
    (action: 'push' | 'pull') => {
      trackEvent({
        name: 'Display ' + action + ' Versionning Modal',
        action: 'click',
      });
      setIsOpen(false);
      setVersionVisible(action);
    },
    [trackEvent]
  );

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
    a.setAttribute(
      'download',
      `workspace-${kebabCase(localize(workspace.name))}-${workspace.id}.zip`
    );
    a.setAttribute('href', URL.createObjectURL(zip));
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setExporting(false);
    setIsOpen(false);
  }, [exporting, localize, trackEvent, workspace.id, workspace.name]);

  const menu: ItemType[] = useMemo(
    () => [
      {
        key: 'editSource',
        label: (
          <button
            onClick={onDisplaySource}
            className="flex flex-1 flex-row items-center"
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
            className="flex flex-1 flex-row items-center"
          >
            <UsersIcon className="mr-2" />
            {t(`expert.security`)}
          </button>
        ),
      },
      {
        key: 'editSecrets',
        label: (
          <button
            onClick={onEditSecrets}
            className="flex flex-1 flex-row items-center"
          >
            <svg
              className="mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              width="1em"
              height="1em"
            >
              <path
                fill="currentColor"
                d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17l0 80c0 13.3 10.7 24 24 24l80 0c13.3 0 24-10.7 24-24l0-40 40 0c13.3 0 24-10.7 24-24l0-40 40 0c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"
              />
            </svg>
            {t(`workspace.secrets.edit.label`)}
          </button>
        ),
      },
      { type: 'divider' },
      {
        key: 'publishApp',
        label: (
          <button
            onClick={onPublishAsApp}
            className="flex flex-1 flex-row items-center"
          >
            <AppstoreAddOutlined className="mr-2" />
            {t(`apps.publish.menuLabel`)}
          </button>
        ),
      },
      {
        key: 'versionPush',
        label: (
          <button
            onClick={() => onVersion('push')}
            className="flex flex-1 flex-row items-center"
          >
            <ArrowUp className="mr-2" />
            {t(`workspace.versions.create.label`)}
          </button>
        ),
      },
      {
        key: 'versionPull',
        label: (
          <button
            onClick={() => onVersion('pull')}
            className="flex flex-1 flex-row items-center"
          >
            <ArrowDown className="mr-2" />
            {t(`workspace.versions.pull.label`)}
          </button>
        ),
      },
      {
        key: 'export',
        label: (
          <button
            onClick={onExport}
            className="flex flex-1 flex-row items-center"
          >
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
    [
      exporting,
      onDisplayRoles,
      onDisplaySource,
      onExport,
      onPublishAsApp,
      onVersion,
      t,
    ]
  );
  return (
    <>
      <PublishModal
        visible={publishVisible}
        close={() => setPublishVisible(false)}
      />
      <EditSecretsModal
        visible={editSecretsVisible}
        close={() => setEditSecretsVisible(false)}
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
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <>{children}</>
      </Dropdown>
    </>
  );
};

export default ActionsMenu;
