import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import getLayout, { useWorkspace } from '../layouts/WorkspaceLayout';
import Error404 from './Errors/404';
import { useTranslation } from 'next-i18next';
import {
  Button,
  Loading,
  notification,
  PageHeader,
} from '@prisme.ai/design-system';
import { LoadingOutlined } from '@ant-design/icons';
import useLocalizedText from '../utils/useLocalizedText';
import PageBuilder from '../components/PageBuilder';
import { PageBuilderContext } from '../components/PageBuilder/context';
import usePages from '../components/PagesProvider/context';
import EditDetails from '../layouts/EditDetails';
import { Schema } from '../components/SchemaForm/types';
import SharePage from '../components/Share/SharePage';

export const Page = () => {
  const { t } = useTranslation('workspaces');
  const { t: commonT } = useTranslation('common');
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
  }, [commonT, pageId, setShare, t]);

  useEffect(() => {
    if (!page) return;
    setValue({
      ...page,
      widgets: (page.widgets || []).map((widget) => ({ ...widget })),
    });
  }, [page]);

  const detailsFormSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          title: t('pages.details.slug.label'),
        },
        name: {
          type: 'string',
          title: t('pages.details.name.label'),
          'ui:options': { localizedText: true },
        },
        description: {
          'ui:widget': 'textarea',
          title: t('pages.details.description.label'),
          'ui:options': { rows: 10, localizedText: true },
        },
      },
    }),
    [t]
  );

  const cleanValue = useCallback(
    (value: Prismeai.Page) => {
      return {
        ...value,
        widgets: ((value.widgets ||
          []) as PageBuilderContext['page']['widgets']).map(
          ({ key, ...widget }) => widget
        ),
        id: page ? page.id : '',
      };
    },
    [page]
  );

  const save = useCallback(async () => {
    if (!value || !page || !page.id) return;
    setSaving(true);
    try {
      await savePage(workspace.id, cleanValue(value));

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
  }, [cleanValue, page, savePage, t, value, workspace.id]);

  const confirmDeletePage = useCallback(async () => {
    await push(`/workspaces/${workspace.id}`);

    deletePage(workspace.id, `${pageId}`);
    notification.success({
      message: t('pages.delete.toast'),
      placement: 'bottomRight',
    });
  }, [deletePage, pageId, push, t, workspace]);

  const updateDetails = useCallback(
    async ({
      slug,
      name,
      description,
    }: {
      slug: string;
      name: Prismeai.LocalizedText;
      description: Prismeai.LocalizedText;
    }) => {
      if (!value) return;
      const newValue = { ...cleanValue(value), slug, name, description };
      setValue(newValue);
      try {
        await savePage(workspace.id, newValue);
        notification.success({
          message: t('pages.save.toast'),
          placement: 'bottomRight',
        });
      } catch (e) {
        const error: any = e;
        if (error.details) {
          notification.error({
            message: t('pages.save.error', {
              context: Object.keys(error.details || {})[0],
            }),
            placement: 'bottomRight',
          });
          return error.details;
        }
        throw e;
      }
    },
    [cleanValue, savePage, value, workspace.id]
  );

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
            {localize(value.name)}
            <EditDetails
              schema={detailsFormSchema}
              value={{ ...value }}
              onSave={updateDetails}
              onDelete={confirmDeletePage}
              context="pages"
            />
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
