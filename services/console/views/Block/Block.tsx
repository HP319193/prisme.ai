import { useRouter } from 'next/router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useKeyboardShortcut from '../../components/useKeyboardShortcut';
import getLayout from '../../layouts/WorkspaceLayout';
import { useWorkspace } from '../../providers/Workspace';
import { Button, Schema } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import useDirtyWarning from '../../utils/useDirtyWarning';
import { TrackingCategory, useTracking } from '../../components/Tracking';
import { BlockProvider, useBlock } from '../../providers/Block';
import Head from 'next/head';
import useLocalizedText from '../../utils/useLocalizedText';
import { notification, PageHeader, Segmented, Tooltip } from 'antd';
import HorizontalSeparatedNav from '../../components/HorizontalSeparatedNav';
import EditableTitle from '../../components/EditableTitle';
import EditDetails from '../../layouts/EditDetails';
import CopyIcon from '../../icons/copy.svgr';
import {
  CodeOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import SourceEdit from '../../components/SourceEdit/SourceEdit';
import { validateBlock } from '@prisme.ai/validation';
import { ValidationError } from '../../utils/yaml';
import { replaceSilently } from '../../utils/urls';
import { ApiError } from '../../utils/api';
import { incrementName } from '../../utils/incrementName';
import BlockPreview from './BlockPreview';

const Block = () => {
  const { t } = useTranslation('workspaces');
  const { trackEvent } = useTracking();
  const { replace, push } = useRouter();
  const { localize } = useLocalizedText();
  const { block, saveBlock, deleteBlock } = useBlock();
  const {
    workspace: { id: workspaceId, blocks = {} },
    createBlock,
  } = useWorkspace();
  const [value, setValue] = useState(block);
  const [viewMode, setViewMode] = useState(
    (value?.blocks || []).length === 0 ? 1 : 0
  );
  const [dirty] = useDirtyWarning(block, value);
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const duplicate = useCallback(async () => {
    if (!block.slug) return;
    trackEvent({
      name: 'Duplicate Block',
      action: 'click',
    });
    setDuplicating(true);
    const newSlug = incrementName(
      block.slug,
      Object.keys(blocks).map((k) => k),
      '{{name}}-{{n}}',
      { keepOriginal: true }
    );
    try {
      await createBlock({
        ...block,
        slug: newSlug,
      });
      push(`/workspaces/${workspaceId}/blocks/${newSlug}`);
      setDuplicating(false);
      notification.success({
        message: t('blocks.duplicate.success'),
        placement: 'bottomRight',
      });
    } catch {
      notification.error({
        message: t('blocks.duplicate.error'),
        placement: 'bottomRight',
      });
    }
  }, [block, blocks, createBlock, push, t, trackEvent, workspaceId]);

  useEffect(() => {
    setValue(block);
  }, [block]);

  const onDelete = useCallback(() => {
    trackEvent({
      name: 'Delete Page',
      action: 'click',
    });
    replace(`/workspaces/${workspaceId}`);
    deleteBlock();
  }, [deleteBlock, replace, trackEvent, workspaceId]);

  const save = useCallback(async () => {
    setSaving(true);
    const prevSlug = block.slug;
    trackEvent({
      name: 'Save Block',
      action: 'click',
    });
    try {
      const saved = await saveBlock(value);
      if (!saved) return;
      notification.success({
        message: t('blocks.save.toast'),
        placement: 'bottomRight',
      });
      const { slug: newSlug } = saved;
      if (newSlug !== prevSlug) {
        replaceSilently(`/workspaces/${workspaceId}/blocks/${newSlug}`);
      }
    } catch (e) {
      const { details, error } = e as ApiError;
      const description = (
        <ul>
          {details ? (
            details.map(({ path, message }: any, key: number) => (
              <li key={key}>
                {t('openapi', {
                  context: message,
                  path: path.replace(/^\.body\./, ''),
                  ns: 'errors',
                })}
              </li>
            ))
          ) : (
            <li>{t('blocks.save.reason', { context: error })}</li>
          )}
        </ul>
      );
      notification.error({
        message: t('blocks.save.error'),
        description,
        placement: 'bottomRight',
      });
    }
    setSaving(false);
  }, [block.slug, saveBlock, t, trackEvent, value, workspaceId]);

  useKeyboardShortcut([
    {
      key: 's',
      meta: true,
      command: (e) => {
        e.preventDefault();
        trackEvent({
          name: 'Save Page with shortcut',
          action: 'keydown',
        });
        save();
      },
    },
  ]);

  // Need to get the latest version with the latest value associated
  const saveAfterChange = useRef(save);
  useEffect(() => {
    saveAfterChange.current = save;
  }, [save]);

  const detailsFormSchema: Schema = useMemo(
    () => ({
      type: 'object',
      properties: {
        name: {
          type: 'localized:string',
          title: t('blocks.details.name.label'),
        },
        slug: {
          type: 'string',
          title: t('blocks.details.slug.label'),
        },
        description: {
          type: 'localized:string',
          title: t('blocks.details.description.label'),
          'ui:widget': 'textarea',
          'ui:options': { textarea: { rows: 10 } },
        },
      },
    }),
    [t]
  );

  const [displaySource, setDisplaySource] = useState(false);
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
  const source = useMemo(() => {
    return value;
  }, [value]);

  const setSource = useCallback(
    (source: any) => {
      setValue(mergeSource(source));
    },
    [mergeSource]
  );
  const [validationError, setValidationError] = useState<ValidationError>();
  const validateSource = useCallback(({ slug, ...json }: any) => {
    const isValid = validateBlock(json);
    const [error] = validateBlock.errors || [];
    setValidationError(error as ValidationError);
    return isValid;
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
                  value={value.name || ''}
                  onChange={(name) => {
                    setValue({
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
              <Tooltip
                title={t('details.title', { context: 'blocks' })}
                placement="bottom"
              >
                <EditDetails
                  schema={detailsFormSchema}
                  value={value}
                  onSave={async (v) => {
                    trackEvent({
                      name: 'Save Page details',
                      action: 'click',
                    });
                    setValue({
                      ...value,
                      ...v,
                    });
                    // Need to wait after the onChange changed the value
                    setTimeout(() => {
                      saveAfterChange.current();
                    });
                  }}
                  onDelete={onDelete}
                  context="blocks"
                />
              </Tooltip>
            </HorizontalSeparatedNav.Separator>
            <HorizontalSeparatedNav.Separator>
              <Tooltip title={t('blocks.duplicate.help')} placement="bottom">
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
              <Tooltip title={t('blocks.source.help')} placement="bottom">
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
                      ? t('blocks.source.close')
                      : t('blocks.source.label')}
                  </span>
                </button>
              </Tooltip>
            </HorizontalSeparatedNav.Separator>
          </HorizontalSeparatedNav>
        }
        extra={[
          <div className="overflow-hidden" key="buttons">
            <Button
              onClick={save}
              disabled={!dirty || saving}
              variant="primary"
            >
              {saving && <LoadingOutlined />}
              {t('blocks.save.label')}
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
                      <Tooltip
                        title={t('blocks.preview.label')}
                        placement="bottom"
                      >
                        <EyeOutlined />
                      </Tooltip>
                    ),
                    disabled: (value?.blocks || []).length === 0,
                  },
                  {
                    value: 1,
                    icon: (
                      <Tooltip title={t('blocks.edit')} placement="bottom">
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
        <BlockPreview {...value} />
        <SourceEdit
          value={source}
          onChange={setSource}
          onSave={save}
          visible={displaySource}
          validate={validateSource}
          error={validationError}
        />
        {viewMode === 1 && (
          <div className="absolute top-0 bottom-0 left-0 right-0 bg-white">
            <div className="m-4">
              Block builder is not ready yet, please edit code source ☝️.
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const BlockWithProvider = () => {
  const {
    query: { blockSlug = [], id: workspaceId },
  } = useRouter();

  const slug = (Array.isArray(blockSlug) ? blockSlug : [blockSlug]).join('/');

  return (
    <TrackingCategory category="Block Builder">
      <BlockProvider workspaceId={`${workspaceId}`} slug={`${slug}`}>
        <Block />
      </BlockProvider>
    </TrackingCategory>
  );
};
BlockWithProvider.getLayout = getLayout;
export default BlockWithProvider;
