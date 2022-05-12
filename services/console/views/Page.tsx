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
  Tooltip,
} from '@prisme.ai/design-system';
import { LoadingOutlined } from '@ant-design/icons';
import useLocalizedText from '../utils/useLocalizedText';
import PageBuilder from '../components/PageBuilder';
import { PageBuilderContext } from '../components/PageBuilder/context';
import { usePages, defaultStyles } from '../components/PagesProvider';
import EditDetails from '../layouts/EditDetails';
import SharePage from '../components/Share/SharePage';
import { useField } from 'react-final-form';
import { CodeEditor } from '../components/CodeEditor/lazy';
import PagePreview from '../components/PagePreview';

const CSSEditor = ({
  name,
  sectionIds,
}: FieldProps & { sectionIds: { id: string; name: string }[] }) => {
  const { t } = useTranslation('workspaces');
  const field = useField(name, {
    defaultValue: defaultStyles,
  });
  const [reseting, setReseting] = useState(false);
  useEffect(() => {
    if (!reseting) return;
    field.input.onChange(defaultStyles);
    setReseting(false);
  }, [field.input, reseting]);
  const completers = useMemo(
    () => [
      {
        identifierRegexps: [/^#/],
        getCompletions(
          editor: any,
          session: any,
          pos: any,
          prefix: any,
          callback: Function
        ) {
          callback(
            null,
            sectionIds.map(({ id, name }) => ({
              name,
              value: `#${id}`,
              score: 1,
              meta: name,
            }))
          );
        },
      },
    ],
    [sectionIds]
  );
  const items = useMemo(
    () => [
      {
        label: (
          <SchemaFormDescription text={t('pages.details.styles.description')}>
            <label className="text-[10px] text-gray cursor-pointer">
              {t('pages.details.styles.label')}
            </label>
          </SchemaFormDescription>
        ),
        content: (
          <div className="relative flex h-80 -m-[1rem] mt-0 rounded-b overflow-hidden">
            {!reseting && (
              <CodeEditor
                mode="css"
                value={field.input.value}
                onChange={field.input.onChange}
                completers={completers}
              />
            )}
            <Tooltip title={t('pages.details.styles.reset.description')}>
              <button
                type="button"
                className="absolute bottom-0 right-0 text-xs pr-2"
                onClick={() => setReseting(true)}
              >
                {t('pages.details.styles.reset.label')}
              </button>
            </Tooltip>
          </div>
        ),
      },
    ],
    [completers, field.input.onChange, field.input.value, reseting, t]
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
  const [displayPreview, setDisplayPreview] = useState(false);
  const [additionalSaveAction, setAdditionalSaveAction] = useState<Function>();

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
          'ui:widget': (props: FieldProps) => (
            <CSSEditor
              {...props}
              sectionIds={
                page
                  ? page.blocks.flatMap(
                      ({ config: { sectionId, name = sectionId } = {} }) =>
                        sectionId ? { id: sectionId, name } : []
                    )
                  : []
              }
            />
          ),
        },
      },
    }),
    [page, t]
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
    if (additionalSaveAction) additionalSaveAction();
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
  }, [
    additionalSaveAction,
    cleanValue,
    page,
    savePage,
    t,
    value,
    workspace.id,
  ]);

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
          <Button
            key="preview"
            onClick={() => setDisplayPreview(!displayPreview)}
          >
            {t('pages.preview.label', {
              context: displayPreview ? 'hide' : '',
            })}
          </Button>,
          <Button key="save" onClick={save} disabled={saving} variant="primary">
            {saving && <LoadingOutlined />}
            {t('pages.save.label')}
          </Button>,
        ]}
      />
      <div className="relative flex flex-1 bg-blue-200 h-full overflow-y-auto">
        <div
          className={`
          rounded
          border-[1px]
          border-gray-200
          overflow-hidden
          absolute top-4 bottom-4 right-4 left-4
          shadow-lg
          bg-white
          flex flex-1
          transition-transform
          transition-duration-200
          transition-ease-in
          z-[11]
          ${displayPreview ? '' : '-translate-x-[110%]'}
        `}
        >
          <PagePreview page={cleanValue(value)} />
        </div>
        <PageBuilder
          value={value}
          onChange={setValue}
          setOnSave={(fn: Function) => setAdditionalSaveAction(() => fn)}
        />
      </div>
    </>
  );
};

Page.getLayout = getLayout;

export default Page;
