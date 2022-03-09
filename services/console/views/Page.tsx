import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import getLayout, { useWorkspace } from '../layouts/WorkspaceLayout';
import Error404 from './Errors/404';
import { useTranslation } from 'next-i18next';
import {
  Button,
  Dropdown,
  EditableTitle,
  Loading,
  Menu,
  Modal,
  PageHeader,
} from '@prisme.ai/design-system';
import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import useLocalizedText from '../utils/useLocalizedText';
import PageBuilder from '../components/PageBuilder';
import { PageBuilderContext } from '../components/PageBuilder/context';
import SharePage from '../components/Share/SharePage';
import usePages from '../components/PagesProvider/context';

export const Page = () => {
  const { t } = useTranslation('workspaces');
  const { workspace, setShare } = useWorkspace();
  const localize = useLocalizedText();
  const { pages, savePage, deletePage } = usePages();

  const {
    query: { id: workspaceId, pageId },
    push,
  } = useRouter();
  const page = useMemo(() => {
    return Array.from(pages.get(`${workspaceId}`) || []).find(
      ({ id }) => pageId === id
    );
  }, [pageId, pages, workspaceId]);

  const [value, setValue] = useState<Prismeai.Page>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setShare({
      label: t('pages.share.label'),
      component: () => <SharePage pageId={`${pageId}`} />,
    });

    return () => {
      setShare(undefined);
    };
  }, [pageId, setShare, t]);

  useEffect(() => {
    if (!page) return;
    setValue({
      ...page,
      widgets: (page.widgets || []).map((widget) => ({ ...widget })),
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
    if (!value || !page || !page.id) return;
    setSaving(true);
    try {
      const cleanedValue = {
        ...value,
        widgets: ((value.widgets ||
          []) as PageBuilderContext['page']['widgets']).map(
          ({ key, ...widget }) => widget
        ),
        id: page.id,
      };
      await savePage(workspace.id, cleanedValue);

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
  }, [page, savePage, t, value, workspace.id]);

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
        deletePage(workspace.id, `${pageId}`);
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
          <Button onClick={save} disabled={saving} key="save">
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
