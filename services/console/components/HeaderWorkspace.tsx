import { useCallback, useMemo, useState } from 'react';
import {
  AppstoreAddOutlined,
  CodeOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import {
  Button,
  notification,
  Popover,
  Schema,
  Space,
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

const HeaderWorkspace = () => {
  const { t } = useTranslation('workspaces');
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
  const { displaySource, sourceDisplayed } = useWorkspaceLayout();

  const confirmDelete = useCallback(() => {
    push('/workspaces');
    remove({ id });
    notification.success({
      message: t('workspace.delete.toast'),
      placement: 'bottomRight',
    });
  }, [id, push, remove, t]);

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
      <Header
        title={
          <div className="flex flex-row items-center absolute left-0 right-0 lg:justify-center z-[-1] justify-start lg:ml-0 ml-[5rem]">
            <Link href={`/workspaces/${workspace.id}`}>
              <a className="text-white" onClick={hideSource}>
                {localize(currentWorkspace)}
              </a>
            </Link>
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
                    className="flex grow"
                    src="https://studio.prisme.ai/pages/I55NTRH"
                  />
                </div>
              )}
              title={t('help')}
              titleClassName="!bg-white !text-black"
              overlayClassName="pr-full-popover"
            >
              <Button variant="grey" className="!text-white">
                <Space>{t('help')}</Space>
              </Button>
            </Popover>
            <Popover
              content={() => (
                <div className="flex h-[75vh] w-[30rem]">
                  <IFrameLoader
                    className="flex grow"
                    src="https://studio.prisme.ai/pages/xDe6PaQ"
                  />
                </div>
              )}
              title={t('whatsNew')}
              titleClassName="!bg-white !text-black"
              overlayClassName="pr-full-popover"
            >
              <Button variant="grey" className="!text-white">
                <Space>{t('whatsNew')}</Space>
              </Button>
            </Popover>
            <Popover
              content={() => <ShareComponent />}
              title={label || t('share.label')}
              titleClassName="!bg-white !text-black"
            >
              <Button variant="grey" className="!text-white">
                <Space>
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
