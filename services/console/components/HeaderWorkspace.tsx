import { useCallback, useMemo, useState } from 'react';
import {
  AppstoreAddOutlined,
  CodeOutlined,
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
import { useWorkspaces } from './WorkspacesProvider';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Header from './Header';
import ShareWorkspace from './Share/ShareWorkspace';
import PublishModal from './PublishModal';
import EditDetails from '../layouts/EditDetails';
import useLocalizedText from '../utils/useLocalizedText';
import Link from 'next/link';
import { useWorkspace } from './WorkspaceProvider';
import { useWorkspaceLayout } from '../layouts/WorkspaceLayout/context';
import IFrameLoader from './IFrameLoader';
import api from '../utils/api';
import VersionModal from './VersionModal';

const HeaderWorkspace = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { remove, update } = useWorkspaces();
  const [popoverIsVisible, setPopoverIsVisible] = useState(false);
  const {
    workspace,
    workspace: { id, name: currentWorkspace },
    share: { label, component: ShareComponent = ShareWorkspace } = {},
  } = useWorkspace();
  const { push } = useRouter();
  const [publishVisible, setPublishVisible] = useState(false);
  const [versionVisible, setVersionVisible] = useState(false);
  const { displaySource, sourceDisplayed } = useWorkspaceLayout();

  const confirmDelete = useCallback(() => {
    push('/workspaces');
    remove({ id });
    notification.success({
      message: t('workspace.delete.toast'),
      placement: 'bottomRight',
    });
  }, [id, push, remove, t]);

  const publishVersion = useCallback(async () => {
    await update(workspace);
    await api
      .workspaces(workspace.id)
      .versions.create({ description: `${new Date()}` });
  }, [update, workspace]);

  const detailsFormSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        name: {
          type: 'localized:string',
          title: t('workspace.details.name.label'),
        },
        description: {
          type: 'localized:string',
          title: t('workspace.details.description.label'),
          'ui:widget': 'textarea',
          'ui:options': { textarea: { rows: 6 } },
        },
        photo: {
          type: 'string',
          title: t('workspace.details.photo.label'),
          'ui:widget': 'upload',
        },
        links: {
          'ui:widget': () => (
            <div className="!flex flex-1 justify-between !mt-4 !mb-6">
              <Button
                className="flex items-center"
                onClick={() => {
                  displaySource(!sourceDisplayed);
                  setPopoverIsVisible(false);
                }}
              >
                <CodeOutlined className="mr-2" />
                {t(`expert.${sourceDisplayed ? 'hide' : 'show'}`)}
              </Button>
              <div className="flex flex-col items-start">
                <Button
                  className="flex items-center"
                  onClick={() => {
                    setPublishVisible(true);
                    setPopoverIsVisible(false);
                  }}
                >
                  <AppstoreAddOutlined className="mr-2" />
                  {t(`apps.publish.menuLabel`)}
                </Button>
                <Button
                  onClick={() => {
                    setVersionVisible(true);
                    setPopoverIsVisible(false);
                  }}
                >
                  <TagOutlined className="mr-2" />
                  {t('workspace.versions.create.label')}
                </Button>
              </div>
            </div>
          ),
        },
      },
    }),
    [displaySource, sourceDisplayed, t]
  );

  const updateDetails = useCallback(
    async (values: any) => {
      await update({ ...workspace, ...values });
    },
    [update, workspace]
  );

  const hideSource = useCallback(() => {
    if (!sourceDisplayed) return;
    displaySource(false);
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
            <Tooltip title={localize(currentWorkspace)} placement="bottom">
              <div className="flex max-w-[20%] mr-2">
                <Link href={`/workspaces/${workspace.id}`}>
                  <a
                    className="text-white text-xl whitespace-nowrap text-ellipsis overflow-hidden"
                    onClick={hideSource}
                  >
                    {localize(currentWorkspace)}
                  </a>
                </Link>
              </div>
            </Tooltip>
            <EditDetails
              schema={detailsFormSchema}
              value={workspace}
              onSave={updateDetails}
              onDelete={confirmDelete}
              context="workspaces"
              visible={popoverIsVisible}
              onVisibleChange={setPopoverIsVisible}
            />
          </div>
        }
        leftContent={
          <div className="flex flex-row items-center justify-center">
            <Popover
              content={() => (
                <div className="flex h-[75vh] w-[30rem]">
                  <IFrameLoader
                    className="flex flex-1"
                    src={`https://help.pages.prisme.ai/${language}/`}
                  />
                </div>
              )}
              overlayClassName="pr-full-popover"
            >
              <Button variant="grey" className="!text-white">
                <Space className="text-lg">{t('help')}</Space>
              </Button>
            </Popover>
            <Popover
              content={() => (
                <div className="flex h-[75vh] w-[30rem]">
                  <IFrameLoader
                    className="flex flex-1"
                    src={`https://roadmap.pages.prisme.ai/${language}/index`}
                  />
                </div>
              )}
              overlayClassName="pr-full-popover"
            >
              <Button variant="grey" className="!text-white">
                <Space className="text-lg">{t('whatsNew')}</Space>
              </Button>
            </Popover>
            <Popover
              content={() => <ShareComponent />}
              title={label || t('share.label')}
              titleClassName="!bg-white !text-black"
            >
              <Button variant="grey" className="!text-white">
                <Space className="text-lg">
                  {t('share.label')}
                  <ShareAltOutlined className="text-lg" />
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
