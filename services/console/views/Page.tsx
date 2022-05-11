import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import getLayout, { useWorkspace } from '../layouts/WorkspaceLayout';
import Error404 from './Errors/404';
import { useTranslation } from 'next-i18next';
import {
  Button,
  Collapse,
  FieldProps,
  Loading,
  notification,
  PageHeader,
  Schema,
  SchemaFormDescription,
} from '@prisme.ai/design-system';
import { LoadingOutlined } from '@ant-design/icons';
import useLocalizedText from '../utils/useLocalizedText';
import PageBuilder from '../components/PageBuilder';
import { PageBuilderContext } from '../components/PageBuilder/context';
import usePages from '../components/PagesProvider/context';
import EditDetails from '../layouts/EditDetails';
import SharePage from '../components/Share/SharePage';
import { useField } from 'react-final-form';
import { CodeEditor } from '../components/CodeEditor/lazy';

const CSSEditor = ({ name }: FieldProps) => {
  const { t } = useTranslation('workspaces');
  const field = useField(name);
  const items = useMemo(
    () => [
      {
        label: (
          <SchemaFormDescription text={t('pages.details.css.description')}>
            <label className="text-[10px] text-gray cursor-pointer">
              {t('pages.details.css.label')}
            </label>
          </SchemaFormDescription>
        ),
        content: (
          <div className="flex h-80 -m-[1rem] mt-0 rounded-b overflow-hidden">
            <CodeEditor
              mode="css"
              value={field.input.value}
              onChange={field.input.onChange}
            />
          </div>
        ),
      },
    ],
    [field.input.onChange, field.input.value, t]
  );
  return (
    <div className="my-2 p-0 border-[1px] border-gray-200 rounded">
      <Collapse items={items} />
    </div>
  );
};

export const Page = () => {
  const { t } = useTranslation('workspaces');
  const { t: commonT } = useTranslation('common');
  const { workspace, setShare } = useWorkspace();
  const { localize } = useLocalizedText();
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
      component: () => (
        <SharePage
          pageId={`${pageId}`}
          pageSlug={(page && page.slug) || `${pageId}`}
        />
      ),
    });

    return () => {
      setShare(undefined);
    };
  }, [commonT, page, pageId, setShare, t]);

  useEffect(() => {
    if (!page) return;
    setValue({
      ...page,
      blocks: (page.blocks || []).map((block) => ({ ...block })),
    });
  }, [page]);

  const detailsFormSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        name: {
          type: 'localized:string',
          title: t('pages.details.name.label'),
        },
        slug: {
          type: 'string',
          title: t('pages.details.slug.label'),
        },
        description: {
          type: 'localized:string',
          title: t('pages.details.description.label'),
          'ui:widget': 'textarea',
          'ui:options': { textarea: { rows: 10 } },
        },
        styles: {
          type: 'string',
          'ui:widget': CSSEditor,
        },
      },
    }),
    [t]
  );

  const cleanValue = useCallback(
    (value: Prismeai.Page) => ({
      ...value,
      blocks: ((value.blocks ||
        []) as PageBuilderContext['page']['blocks']).map(
        ({ key, ...block }) => block
      ),
      id: page ? page.id : '',
    }),
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
      styles,
    }: {
      slug: string;
      name: Prismeai.LocalizedText;
      description: Prismeai.LocalizedText;
      styles: string;
    }) => {
      if (!value) return;
      const newValue = {
        ...cleanValue(value),
        slug,
        name,
        description,
        styles,
      };
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
    [cleanValue, savePage, t, value, workspace.id]
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
          <Button onClick={save} disabled={saving} key="save" variant="primary">
            {saving && <LoadingOutlined />}
            {t('pages.save.label')}
          </Button>,
        ]}
      />
      <div className="relative flex flex-1 bg-blue-200 h-full overflow-y-auto">
        <PageBuilder value={value} onChange={setValue} />
      </div>
    </>
  );
};

Page.getLayout = getLayout;

export default Page;
