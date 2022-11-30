import {
  CodeOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { Button, FieldProps, Popover, Schema } from '@prisme.ai/design-system';
import { PageHeader, Segmented, Space, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import EditableTitle from '../../components/AutomationBuilder/EditableTitle';
import HorizontalSeparatedNav from '../../components/HorizontalSeparatedNav';
import SharePage from '../../components/Share/SharePage';
import EditDetails from '../../layouts/EditDetails';
import CopyIcon from '../../icons/copy.svgr';
import Head from 'next/head';
import useLocalizedText from '../../utils/useLocalizedText';
import PagePreview from '../../components/PagePreview';
import { useCallback, useMemo } from 'react';
import { useWorkspace } from '../../components/WorkspaceProvider';
import { useApps } from '../../components/AppsProvider';
import { PageBuilderContext } from '../../components/PageBuilder/context';
import PageBuilder from '../../components/PageBuilder';
import CSSEditor from './CSSEditor';

interface PageRendererProps {
  value: Prismeai.Page;
  onChange: (page: Prismeai.Page) => void;
  onDelete: () => void;
  onSave: () => void;
  saving: boolean;
  viewMode: number;
  setViewMode: (v: number) => void;
}
export const PageRenderer = ({
  value,
  onChange,
  onDelete,
  onSave,
  saving,
  viewMode,
  setViewMode,
}: PageRendererProps) => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { workspace } = useWorkspace();
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
                value
                  ? (
                      value.blocks || []
                    ).flatMap(
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
    [value, t]
  );

  const duplicate = useCallback(() => {
    alert('coming soon');
  }, []);

  const showSource = useCallback(() => {
    alert('coming soon');
  }, []);

  return (
    <>
      <Head>
        <title>
          {t('page_title', {
            elementName: localize(value.name),
          })}
        </title>
      </Head>
      <PageHeader
        className="h-[4rem] flex items-center"
        title={
          <HorizontalSeparatedNav>
            <HorizontalSeparatedNav.Separator>
              <span className="pr-page-title">
                <EditableTitle
                  value={value.name}
                  onChange={(name) =>
                    onChange({
                      ...value,
                      name,
                    })
                  }
                  onEnter={(name) => {
                    onChange({
                      ...value,
                      name,
                    });
                    onSave();
                  }}
                  className="text-base font-bold max-w-[25vw]"
                />
              </span>
            </HorizontalSeparatedNav.Separator>
            <HorizontalSeparatedNav.Separator>
              <Tooltip
                title={t('details.title', { context: 'pages' })}
                placement="bottom"
              >
                <EditDetails
                  schema={detailsFormSchema}
                  value={{ ...value }}
                  onSave={async (v) => {
                    onChange({
                      ...value,
                      ...v,
                    });
                  }}
                  onDelete={onDelete}
                  context="pages"
                />
              </Tooltip>
              <Popover
                content={() => (
                  <SharePage
                    pageId={`${value.id}`}
                    pageSlug={value.slug || ''}
                  />
                )}
                title={t('pages.share.label')}
              >
                <button className="ml-4 !px-0 focus:outline-none">
                  <Space>
                    <Tooltip title={t('pages.share.label')} placement="bottom">
                      <ShareAltOutlined className="text-lg" />
                    </Tooltip>
                  </Space>
                </button>
              </Popover>
            </HorizontalSeparatedNav.Separator>
            <HorizontalSeparatedNav.Separator>
              <Tooltip title={t('pages.duplicate.help')} placement="bottom">
                <button
                  className="flex flex-row focus:outline-none items-center pr-4"
                  onClick={duplicate}
                >
                  <span className="mr-2">
                    <CopyIcon width="1.2rem" height="1.2rem" />
                  </span>
                  {t('duplicate', { ns: 'common' })}
                </button>
              </Tooltip>
              <Tooltip title={t('pages.source.help')} placement="bottom">
                <button
                  className="flex flex-row focus:outline-none items-center"
                  onClick={showSource}
                >
                  <span className="mr-2">
                    <CodeOutlined width="1.2rem" height="1.2rem" />
                  </span>
                  {t('pages.source.label')}
                </button>
              </Tooltip>
            </HorizontalSeparatedNav.Separator>
          </HorizontalSeparatedNav>
        }
        extra={[
          <div className="overflow-hidden" key="buttons">
            <Button onClick={onSave} disabled={saving} variant="primary">
              {saving && <LoadingOutlined />}
              {t('pages.save.label')}
            </Button>
          </div>,
          <div key="views">
            <div className="ml-3">
              <Segmented
                key="nav"
                options={[
                  {
                    value: 0,
                    icon: (
                      <Tooltip title={t('pages.preview')} placement="bottom">
                        <EyeOutlined />
                      </Tooltip>
                    ),
                    disabled: (value?.blocks || []).length === 0,
                  },
                  {
                    value: 1,
                    icon: (
                      <Tooltip title={t('pages.edit')} placement="bottom">
                        <EditOutlined />
                      </Tooltip>
                    ),
                  },
                ]}
                value={(value.blocks || []).length === 0 ? 1 : viewMode}
                className="pr-segmented-accent"
                onChange={(v) => setViewMode(+v)}
              />
            </div>
          </div>,
        ]}
      />

      <div className="relative flex flex-1 bg-blue-200 h-full overflow-y-auto">
        <PagePreview page={value} />
        {((value.blocks || []).length === 0 || viewMode === 1) && (
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-white">
            <PageBuilder value={value} onChange={onChange} blocks={blocks} />
          </div>
        )}
      </div>
    </>
  );
};

export default PageRenderer;
