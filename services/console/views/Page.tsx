import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import getLayout, { useWorkspace } from '../layouts/WorkspaceLayout';
import Error404 from './Errors/404';
import { useTranslation } from 'next-i18next';
import {
  Button,
  Dropdown,
  EditableTitle,
  Menu,
  PageHeader,
} from '@prisme.ai/design-system';
import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { Modal, notification } from 'antd';
import useLocalizedText from '../utils/useLocalizedText';
import PageBuilder from '../components/PageBuilder';
import { useWorkspaces } from '../components/WorkspacesProvider';
import { PageBuilderContext } from '../components/PageBuilder/context';
import Loading from '../components/Loading';

export const Page = () => {
  const { t } = useTranslation('workspaces');
  const { updatePage, deletePage } = useWorkspaces();
  const { workspace } = useWorkspace();
  const localize = useLocalizedText();

  const {
    query: { pageId },
    push,
  } = useRouter();
  const page = (workspace.pages || {})[`${pageId}`];
  const [value, setValue] = useState<Prismeai.Page>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue({
      ...page,
      widgets: page.widgets.map((widget) => ({ ...widget })),
    });
  }, [page]);

  const updateTitle = useCallback(
    (newTitle: string) => {
      if (!value) return;
      setValue({ ...value, name: newTitle });
    },
    [value]
  );

  const save = useCallback(async () => {
    if (!value) return;
    setSaving(true);
    try {
      const cleanedValue = {
        ...value,
        widgets: (value.widgets as PageBuilderContext['page']['widgets']).map(
          ({ key, ...widget }) => widget
        ),
      };
      await updatePage(workspace, `${pageId}`, cleanedValue);

      notification.success({
        message: t('pages.save.toast'),
        placement: 'bottomRight',
      });
    } catch (e) {
      notification.error({
        message: t('pages.save.error'),
        placement: 'bottomRight',
      });
    }
    setSaving(false);
  }, [pageId, t, updatePage, value, workspace]);

  const confirmDeletePage = useCallback(() => {
    Modal.confirm({
      icon: <DeleteOutlined />,
      title: t('pages.delete.confirm.title', {
        name: pageId,
      }),
      content: t('pages.delete.confirm.content'),
      cancelText: t('pages.delete.confirm.ok'),
      okText: t('pages.delete.confirm.cancel'),
      onCancel: () => {
        push(`/workspaces/${workspace.id}`);
        deletePage(workspace, `${pageId}`);
        notification.success({
          message: t('pages.delete.toast'),
          placement: 'bottomRight',
        });
      },
    });
  }, [deletePage, pageId, push, t, workspace]);

  if (!page) {
    return <Error404 link={`/workspaces/${workspace.id}`} />;
  }

  if (!value) {
    return <Loading />;
  }

  return (
    <>
      <PageHeader
        title={
          <div className="flex flex-row items-center">
            <EditableTitle
              value={localize(value.name)}
              onChange={updateTitle}
              level={4}
              className="!m-0 !ml-4"
            />
            <Dropdown
              Menu={
                <Menu
                  items={[
                    {
                      label: (
                        <div className="flex items-center">
                          <DeleteOutlined className="mr-2" />
                          {t('pages.delete.label')}
                        </div>
                      ),
                      key: 'delete',
                    },
                  ]}
                  onClick={confirmDeletePage}
                />
              }
            >
              <div className="mx-1" />
            </Dropdown>
          </div>
        }
        onBack={() => push(`/workspaces/${workspace.id}`)}
        RightButtons={[
          <Button onClick={save} disabled={saving} key="1">
            {saving && <LoadingOutlined />}
            {t('pages.save.label')}
          </Button>,
        ]}
      />
      <div className="relative flex flex-1">
        <PageBuilder value={value} onChange={setValue} />
      </div>
    </>
  );
};

Page.getLayout = getLayout;

export default Page;
