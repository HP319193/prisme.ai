import {
  CloseCircleOutlined,
  CodeOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
  ReloadOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { Button, Popover } from '@prisme.ai/design-system';
import { PageHeader, Segmented, Space, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import EditableTitle from '../../components/EditableTitle';
import HorizontalSeparatedNav from '../../components/HorizontalSeparatedNav';
import SharePage from '../../components/Share/SharePage';
import EditDetails from './EditDetails';
import CopyIcon from '../../icons/copy.svgr';
import Head from 'next/head';
import useLocalizedText from '../../utils/useLocalizedText';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PageBuilder from '../../components/PageBuilder';
import { validatePage } from '@prisme.ai/validation';
import SourceEdit, {
  ValidationError,
} from '../../components/SourceEdit/SourceEdit';
import { defaultStyles } from './defaultStyles';
import { useTracking } from '../../components/Tracking';
import { getBackTemplateDots } from '../../utils/templatesInBlocks';
import PagePreview, { usePagePreview } from './PagePreview';
import { useWorkspace } from '../../providers/Workspace';

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
  dirty: boolean;
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
  dirty,
}: PageRendererProps) => {
  const { t } = useTranslation('workspaces');
  const { localize } = useLocalizedText();
  const { workspace } = useWorkspace();
  const [displaySource, setDisplaySource] = useState(false);

  const { trackEvent } = useTracking();
  const { reload } = usePagePreview();

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
    trackEvent({
      name: `${displaySource ? 'Hide' : 'Show'} source code`,
      action: 'click',
    });
    setDisplaySource(!displaySource);
  }, [displaySource, trackEvent]);
  const mergeSource = useCallback(
    (source: any) => ({
      ...value,
      ...source,
    }),
    [value]
  );
  const [validationError, setValidationError] = useState<ValidationError>();
  const validateSource = useCallback((json: any) => {
    const isValid = validatePage(json);
    const [error] = validatePage.errors || [];
    setValidationError(error as ValidationError);
    return isValid;
  }, []);
  const [pageKey, setPageKey] = useState(value.id);
  useEffect(() => {
    setPageKey(value.id);
  }, [value.id]);
  const source = useMemo(() => {
    const { id, workspaceSlug, workspaceId, apiKey, ...page } =
      value as Prismeai.Page & { apiKey: string };
    return getBackTemplateDots(page);
  }, [value]);
  const setSource = useCallback(
    (source: any) => {
      onChange(mergeSource(source));
      setPageKey(`${Math.random()}`);
    },
    [mergeSource, onChange]
  );

  const [shareOpen, setShareOpen] = useState(false);
  useEffect(() => {
    trackEvent({
      name: `${shareOpen ? 'Open' : 'Close'} Share Panel`,
      action: 'click',
    });
  }, [shareOpen, trackEvent]);

  return (
    <>
      <Head>
        <title>
          [{localize(workspace.name)}]{' '}
          {t('page_title', {
            elementName: localize(value.name),
          })}
        </title>
      </Head>
      <PageHeader
        key={pageKey}
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
                    trackEvent({
                      name: 'Save title',
                      action: 'keydown',
                    });
                    // Need to wait after the onChange changed the value
                    setTimeout(() => saveAfterChange.current(), 1);
                  }}
                  className="text-base font-bold max-w-[25vw]"
                />
              </span>
            </HorizontalSeparatedNav.Separator>
            <HorizontalSeparatedNav.Separator>
              <Tooltip title={t('pages.details.title')} placement="bottom">
                <EditDetails
                  key={pageKey}
                  value={{
                    ...value,
                    styles:
                      value.styles === undefined ? defaultStyles : value.styles,
                  }}
                  onSave={async (v) => {
                    trackEvent({
                      name: 'Save Page details',
                      action: 'click',
                    });
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
                onOpenChange={setShareOpen}
                titleClassName="flex m-0 pb-0 pt-4 pl-4 pr-4"
                title={({ setOpen }) => (
                  <div className="flex flex-1 justify-between">
                    {t('pages.share.label')}
                    <button
                      onClick={() => {
                        setOpen(false);
                      }}
                    >
                      <CloseCircleOutlined />
                    </button>
                  </div>
                )}
                content={() => (
                  <SharePage
                    pageId={`${value.id}`}
                    pageSlug={value.slug === 'index' ? '' : value.slug || ''}
                    workspaceId={value.workspaceId!}
                  />
                )}
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
            <Button
              onClick={onSave}
              disabled={!dirty || saving}
              variant="primary"
            >
              {saving && <LoadingOutlined />}
              {t('pages.save.label')}
            </Button>
          </div>,
          <div className="ml-4 overflow-hidden" key="reload">
            <Tooltip title={t('pages.reload')} placement="bottom">
              <Button onClick={reload} variant="primary">
                <ReloadOutlined />
              </Button>
            </Tooltip>
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
                value={viewMode}
                className="pr-segmented-accent"
                onChange={(v) => setViewMode(+v)}
              />
            </div>
          </div>,
        ]}
      />

      <div className="relative flex flex-1 bg-blue-200 h-full overflow-y-auto overflow-x-hidden">
        <PagePreview page={value} visible={viewMode === 0} />
        <SourceEdit
          value={source}
          onChange={setSource}
          onSave={onSave}
          visible={displaySource}
          validate={validateSource}
          error={validationError}
        />
        <div
          className={`absolute top-0 bottom-0 left-0 right-0 bg-white transition-transform ${
            viewMode === 1 ? '' : 'translate-x-full'
          }`}
        >
          <PageBuilder
            key={pageKey}
            value={value.blocks}
            onChange={saveBlocks}
          />
        </div>
      </div>
    </>
  );
};

export default PageRenderer;
