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
import { SLUG_VALIDATION_REGEXP } from '../utils/regex';

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
    // Removed from UI while we don't have the feature fully working
    // (Ability to display page with a link, without sharing the workspace)

    setShare({
      label: t('pages.share.label'),
      // component: () => <SharePage pageId={`${pageId}`} />,
      component: () => <div>{commonT('soon')}</div>,
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
      name,
      description,
    }: {
      name: Prismeai.LocalizedText;
      description: Prismeai.LocalizedText;
    }) => {
      if (!value) return;
      const newValue = { ...value, name, description };
      setValue(newValue);
      await savePage(workspace.id, newValue);
    },
    [savePage, value, workspace.id]
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
              value={{ ...value, slug: pageId }}
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
