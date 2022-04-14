import { useCallback, useMemo, useState } from 'react';
import {
  AppstoreAddOutlined,
  CodeOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { Button, notification, Popover, Space } from '@prisme.ai/design-system';
import { useWorkspaces } from './WorkspacesProvider';
import { useWorkspace } from '../layouts/WorkspaceLayout';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Header from './Header';
import ShareWorkspace from './Share/ShareWorkspace';
import PublishModal from './PublishModal';
import EditDetails from '../layouts/EditDetails';
import useLocalizedText from '../utils/useLocalizedText';
import { Schema } from './SchemaForm/types';
import Link from 'next/link';
import PhotoPickr from './PhotoPickr';

const HeaderWorkspace = () => {
  const { t } = useTranslation('workspaces');
  const localize = useLocalizedText();
  const { remove, update } = useWorkspaces();
  const [popoverIsVisible, setPopoverIsVisible] = useState(false);
  const {
    workspace,
    workspace: { id, name: currentWorkspace },
    displaySource,
    sourceDisplayed,
    share: { label, component: ShareComponent = ShareWorkspace } = {},
  } = useWorkspace();
  const { push } = useRouter();
  const [publishVisible, setPublishVisible] = useState(false);

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
          type: 'string',
          title: t('workspace.details.name.label'),
          'ui:options': { localizedText: true },
        },
        description: {
          'ui:widget': 'textarea',
          title: t('workspace.details.description.label'),
          'ui:options': { rows: 6, localizedText: true },
        },
        photo: {
          'ui:widget': PhotoPickr,
        },
        links: {
          'ui:widget': () => (
            <div className="ant-input !flex flex-1 justify-between">
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
      'ui:options': {
        layout: 'columns',
        lines: [[['photo'], ['name', 'description']], ['links']],
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
          <div className="flex flex-row items-center absolute left-0 right-0 justify-center z-[-1]">
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
          <Popover
            content={() => <ShareComponent />}
            title={label || t('share.label')}
          >
            <Button variant="grey" className="!text-white">
              <Space>
                {t('share.label')}
                <ShareAltOutlined />
              </Space>
            </Button>
          </Popover>
        }
      />
    </>
  );
};

export default HeaderWorkspace;
