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
import EditableTitle from '../../components/EditableTitle';
import HorizontalSeparatedNav from '../../components/HorizontalSeparatedNav';
import SharePage from '../../components/Share/SharePage';
import EditDetails from '../../layouts/EditDetails';
import CopyIcon from '../../icons/copy.svgr';
import Head from 'next/head';
import useLocalizedText from '../../utils/useLocalizedText';
import PagePreview from '../../components/PagePreview';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PageBuilder from '../../components/PageBuilder';
import CSSEditor from './CSSEditor';
import { validatePage } from '@prisme.ai/validation';
import SourceEdit from '../../components/SourceEdit/SourceEdit';
import { defaultStyles } from './defaultStyles';

interface PageRendererProps {
  value: Prismeai.Page;
  onChange: (page: Prismeai.Page) => void;
  onDelete: () => void;
  onSave: () => void;
  saving: boolean;
  viewMode: number;
  setViewMode: (v: number) => void;
  duplicate: () => void;
  duplicating: boolean;
}
export const PageRenderer = ({
  value,
  onChange,
  onDelete,
  onSave,
  saving,
  viewMode,
  setViewMode,
  duplicate,
  duplicating,
}: PageRendererProps) => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const [displaySource, setDisplaySource] = useState(false);

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

  const saveBlocks = useCallback(
    (blocks: Prismeai.Page['blocks']) => {
      onChange({
        ...value,
        blocks,
      });
    },
    [onChange, value]
  );

  // Need to get the latest version with the latest value associated
  const saveAfterChange = useRef(onSave);
  useEffect(() => {
    saveAfterChange.current = onSave;
  }, [onSave]);

  const showSource = useCallback(() => {
    setDisplaySource(!displaySource);
  }, [displaySource]);
  const mergeSource = useCallback(
    (source: any) => ({
      ...value,
      ...source,
    }),
    [value]
  );
  const validateSource = useCallback((json: any) => {
    const isValid = validatePage(json);
    console.log(validatePage.errors);
    return isValid;
  }, []);
  const source = useMemo(() => {
    const {
      id,
      workspaceSlug,
      workspaceId,
      apiKey,
      ...page
    } = value as Prismeai.Page & { apiKey: string };
    return page;
  }, [value]);
  const setSource = useCallback(
    (source: any) => {
      onChange(mergeSource(source));
    },
    [mergeSource, onChange]
  );

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
                  value={value.name || ''}
                  onChange={(name) => {
                    onChange({
                      ...value,
                      name,
                    });
                  }}
                  onEnter={() => {
                    // Need to wait after the onChange changed the value
                    setTimeout(() => saveAfterChange.current(), 1);
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
                  value={{
                    ...value,
                    styles:
                      value.styles === undefined ? defaultStyles : value.styles,
                  }}
                  onSave={async (v) => {
                    onChange({
                      ...value,
                      ...v,
                      styles: v.styles || '',
                    });
                    // Need to wait after the onChange changed the value
                    setTimeout(() => {
                      saveAfterChange.current();
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
                  disabled={duplicating}
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
                  <span
                    className={`flex mr-2 ${
                      displaySource ? 'text-accent' : ''
                    }`}
                  >
                    <CodeOutlined width="1.2rem" height="1.2rem" />
                  </span>
                  <span className="flex">
                    {displaySource
                      ? t('pages.source.close')
                      : t('pages.source.label')}
                  </span>
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
        <SourceEdit
          value={source}
          onChange={setSource}
          onSave={onSave}
          visible={displaySource}
          validate={validateSource}
        />
        {((value.blocks || []).length === 0 || viewMode === 1) && (
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-white">
            <PageBuilder value={value.blocks} onChange={saveBlocks} />
          </div>
        )}
      </div>
    </>
  );
};

export default PageRenderer;
