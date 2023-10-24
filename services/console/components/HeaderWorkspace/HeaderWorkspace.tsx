import { useCallback, useMemo, useState } from 'react';
import {
  AppstoreAddOutlined,
  CodeOutlined,
  ExportOutlined,
  LoadingOutlined,
  ShareAltOutlined,
  TagOutlined,
} from '@ant-design/icons';
import {
  Button,
  notification,
  Popover,
  Schema,
  Space,
  Tooltip,
} from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Header from '../Header';
import ShareWorkspace from '../Share/ShareWorkspace';
import PublishModal from '../PublishModal';
import useLocalizedText from '../../utils/useLocalizedText';
import Link from 'next/link';
import {
  DisplayedSourceType,
  useWorkspaceLayout,
} from '../../layouts/WorkspaceLayout/context';
import VersionModal from '../VersionModal';
import HeaderPopovers from '../../views/HeaderPopovers';
import { useWorkspace } from '../../providers/Workspace';
import { SLUG_VALIDATION_REGEXP } from '../../utils/regex';
import api from '../../utils/api';
import { useTracking } from '../Tracking';
import EditDetails from './EditDetails';

const HeaderWorkspace = () => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { workspace, deleteWorkspace, saveWorkspace, saving } = useWorkspace();
  const [popoverIsVisible, setPopoverIsVisible] = useState(false);

  const { push } = useRouter();
  const [publishVisible, setPublishVisible] = useState(false);
  const [versionVisible, setVersionVisible] = useState(false);
  const { displaySource, sourceDisplayed } = useWorkspaceLayout();

  const { trackEvent } = useTracking();

  const confirmDelete = useCallback(() => {
    push('/workspaces');
    deleteWorkspace();
    notification.success({
      message: t('workspace.delete.toast'),
      placement: 'bottomRight',
    });
  }, [deleteWorkspace, push, t]);

  const [exporting, setExporting] = useState(false);
  const exportWorkspace = useCallback(async () => {
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
  }, [exporting, workspace.id]);

  const updateDetails = useCallback(
    async ({ slug, ...values }: any) => {
      saveWorkspace(values);
      if (slug !== workspace.slug) {
        try {
          await saveWorkspace({ ...values, slug });
        } catch {
          return {
            slug: t('workspace.details.slug.unique'),
          };
        }
      }
    },
    [saveWorkspace, t, workspace.slug]
  );

  const hideSource = useCallback(() => {
    if (!sourceDisplayed) return;
    displaySource(DisplayedSourceType.None);
  }, [displaySource, sourceDisplayed]);

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
      <Header
        title={
          <div className="flex flex-row items-center absolute left-0 right-0 lg:justify-center z-[-1] justify-start lg:ml-0 ml-[5rem]">
            <Tooltip title={localize(workspace.name)} placement="bottom">
              <div className="flex max-w-[20%] mr-2">
                <Link href={`/workspaces/${workspace.id}`}>
                  <a
                    className="text-white whitespace-nowrap text-ellipsis overflow-hidden"
                    onClick={hideSource}
                  >
                    {localize(workspace.name)}
                  </a>
                </Link>
              </div>
            </Tooltip>
            <EditDetails
              value={workspace}
              onSave={updateDetails}
              onDelete={confirmDelete}
              context="workspaces"
              open={popoverIsVisible}
              onOpenChange={setPopoverIsVisible}
              disabled={saving}
              onDisplaySource={() => {
                trackEvent({
                  name: 'Display Source from Details',
                  action: 'click',
                });
                displaySource(
                  sourceDisplayed === DisplayedSourceType.Config
                    ? DisplayedSourceType.None
                    : DisplayedSourceType.Config
                );
                setPopoverIsVisible(false);
              }}
              sourceDisplayed={sourceDisplayed === DisplayedSourceType.Config}
              onDisplayRoles={() => {
                trackEvent({
                  name: 'Display Roles Edition',
                  action: 'click',
                });
                displaySource(
                  sourceDisplayed === DisplayedSourceType.Roles
                    ? DisplayedSourceType.None
                    : DisplayedSourceType.Roles
                );
                setPopoverIsVisible(false);
              }}
              rolesDisplayed={sourceDisplayed === DisplayedSourceType.Roles}
              onPublishAsApp={() => {
                trackEvent({
                  name: 'Display Publish as App Modal',
                  action: 'click',
                });
                setPublishVisible(true);
                setPopoverIsVisible(false);
              }}
              onVersion={() => {
                trackEvent({
                  name: 'Display Versionning Modal',
                  action: 'click',
                });
                setVersionVisible(true);
                setPopoverIsVisible(false);
              }}
              onExport={() => {
                trackEvent({
                  name: 'Export',
                  action: 'click',
                });
                exportWorkspace();
              }}
              exporting={exporting}
            />
          </div>
        }
        leftContent={
          <div className="flex flex-row items-center justify-center">
            <HeaderPopovers />
            <Popover
              content={() => <ShareWorkspace workspaceId={workspace.id} />}
              title={t('share.label')}
              onOpenChange={(open) => {
                trackEvent({
                  name: `${open ? 'Open' : 'Close'} Share Panel`,
                  action: 'click',
                });
              }}
            >
              <Button variant="grey" className="!text-white">
                <Space>
                  {t('share.label')}
                  <ShareAltOutlined />
                </Space>
              </Button>
            </Popover>
            <div className="mx-[1.875rem] h-[1.625rem] border-r border-white border-solid" />
          </div>
        }
      />
    </>
  );
};

export default HeaderWorkspace;