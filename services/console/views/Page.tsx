import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Error404 from './Errors/404';
import { useTranslation } from 'next-i18next';
import cloneDeep from 'lodash/cloneDeep';
import {
  Button,
  Collapse,
  FieldProps,
  Loading,
  notification,
  PageHeader,
  Popover,
  Schema,
  SchemaFormDescription,
  Space,
  Tooltip,
} from '@prisme.ai/design-system';
import Head from 'next/head';
import {
  DeleteOutlined,
  LoadingOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import useLocalizedText from '../utils/useLocalizedText';
import PageBuilder from '../components/PageBuilder';
import { PageBuilderContext } from '../components/PageBuilder/context';
import { defaultStyles, usePages } from '../components/PagesProvider';
import EditDetails from '../layouts/EditDetails';
import SharePage from '../components/Share/SharePage';
import { useField } from 'react-final-form';
import { CodeEditor } from '../components/CodeEditor/lazy';
import PagePreview from '../components/PagePreview';
import useKeyboardShortcut from '../components/useKeyboardShortcut';
import { useApps } from '../components/AppsProvider';
import { useWorkspace } from '../components/WorkspaceProvider';
import getLayout from '../layouts/WorkspaceLayout';
import { useWorkspaceLayout } from '../layouts/WorkspaceLayout/context';
import { usePrevious } from '../utils/usePrevious';

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
            <div className="flex w-[95%] justify-between items-center">
              <label className="font-normal cursor-pointer">
                {t('pages.details.styles.label')}
              </label>
              <Tooltip title={t('pages.details.styles.reset.description')}>
                <button
                  type="button"
                  className="text-gray hover:text-orange-500 pr-2 flex items-center"
                  onClick={(event) => {
                    event.stopPropagation();
                    setReseting(true);
                  }}
                >
                  <DeleteOutlined />
                </button>
              </Tooltip>
            </div>
          </SchemaFormDescription>
        ),
        content: (
          <div className="relative flex h-80 mt-0 rounded-b overflow-hidden">
            {!reseting && (
              <CodeEditor
                mode="css"
                value={field.input.value}
                onChange={field.input.onChange}
                completers={completers}
              />
            )}
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
  const { workspace } = useWorkspace();
  const { setDirty } = useWorkspaceLayout();
  const { localize } = useLocalizedText();
  const { pages, savePage, deletePage } = usePages();
  const [displayPreview, setDisplayPreview] = useState(false);

  const {
    query: { id: workspaceId, pageId },
    push,
  } = useRouter();
  const prevPageId = usePrevious(pageId);

  const page = useMemo(() => {
    return Array.from(pages.get(`${workspaceId}`) || []).find(
      ({ id }) => pageId === id
    );
  }, [pageId, pages, workspaceId]);

  const [value, setValue] = useState<Prismeai.Page>();
  const [saving, setSaving] = useState(false);
  const [eventsInPage, setEventsInPage] = useState<string[]>([]);

  const updateValue = useCallback(
    (page: Prismeai.Page, events: string[] = []) => {
      setValue(page);
      setEventsInPage(Array.from(new Set(events)));
    },
    []
  );

  useEffect(() => {
    const clonedValue = cloneDeep(value) as PageBuilderContext['page'];
    if (clonedValue && clonedValue.blocks) {
      clonedValue.blocks.forEach((block) => {
        delete block.key;
      });
    }

    if (
      pageId === prevPageId &&
      JSON.stringify(page) !== JSON.stringify(clonedValue)
    ) {
      setDirty(true);
    }
  }, [value, pageId, prevPageId, setDirty, page]);

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
                  ? (page.blocks || []).flatMap(
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
      blocks: (
        (value.blocks || []) as PageBuilderContext['page']['blocks']
      ).map(({ key, ...block }) => block),
      id: page ? page.id : '',
    }),
    [page]
  );

  const save = useCallback(async () => {
    if (!value || !page || !page.id) return;
    setSaving(true);
    try {
      await savePage(workspace.id, cleanValue(value), eventsInPage);

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
  }, [cleanValue, eventsInPage, page, savePage, t, value, workspace.id]);

  useKeyboardShortcut([
    {
      key: 's',
      meta: true,
      command: (e) => {
        e.preventDefault();
        save();
      },
    },
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

  const { appInstances } = useApps();
  const blocks: PageBuilderContext['blocks'] = useMemo(() => {
    return [
      {
        slug: '',
        appName: '',
        blocks: Object.keys(workspace.blocks || {}).map((slug) => ({
          slug,
          ...(workspace.blocks || {})[slug],
        })),
      },
      ...(appInstances.get(workspace.id) || []).map(
        ({ slug = '', appName = '', blocks = [] }) => ({
          slug,
          appName,
          blocks: blocks.map(
            ({ slug, description = slug, name = slug, url = '', edit }) => ({
              slug,
              name,
              description,
              url,
              edit,
            })
          ),
        })
      ),
    ];
  }, [appInstances, workspace.id, workspace.blocks]);

  const detailedPage = useCallback(
    (page: Prismeai.Page) => {
      const detailedBlocks = blocks.flatMap(({ slug, blocks }) =>
        blocks.map((block) => ({ ...block, slug: `${slug}.${block.slug}` }))
      );
      return {
        ...page,
        blocks: page.blocks.map((block) => ({
          ...block,
          url: detailedBlocks.find(({ slug }) => slug === block.name)?.url,
        })),
      };
    },
    [blocks]
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
          <div className="flex flex-row items-center text-base">
            <span className="font-medium">{localize(value.name)}</span>
            <span className="w-[20px]" />
            <span className="border-l border-solid border-pr-gray-200 text-gray flex h-[26px] w-[20px]" />
            <span className="text-gray flex">
              <EditDetails
                schema={detailsFormSchema}
                value={{ ...value }}
                onSave={updateDetails}
                onDelete={confirmDeletePage}
                context="pages"
                key={`${pageId}`}
              />
            </span>
          </div>
        }
        RightButtons={[
          <Button
            key="preview"
            onClick={() => setDisplayPreview(!displayPreview)}
          >
            {t('pages.preview.label', {
              context: displayPreview ? 'hide' : '',
            })}
          </Button>,
          <Popover
            content={() => (
              <SharePage
                pageId={`${pageId}`}
                pageSlug={(page && page.slug) || `${pageId}`}
              />
            )}
            title={t('pages.share.label')}
            key="share"
          >
            <Button>
              <Space>
                {t('pages.share.label')}
                <ShareAltOutlined className="text-lg" />
              </Space>
            </Button>
          </Popover>,
          <Button key="save" onClick={save} disabled={saving} variant="primary">
            {saving && <LoadingOutlined />}
            {t('pages.save.label')}
          </Button>,
        ]}
      />
      <Head>
        <title>
          {t('page_title', {
            elementName: localize(page.name),
          })}
        </title>
      </Head>
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
          <PagePreview
            page={detailedPage(cleanValue(value))}
            visible={displayPreview}
          />
        </div>
        <PageBuilder value={value} onChange={updateValue} blocks={blocks} />
      </div>
    </>
  );
};

Page.getLayout = getLayout;

export default Page;
