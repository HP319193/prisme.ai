import { Block } from '../../providers/Block';
import { useWorkspace } from '../../providers/Workspace';
import getConfig from 'next/config';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SchemaForm, Tooltip } from '@prisme.ai/design-system';
import { getDefaults } from './getDefaults';
import { useTranslation } from 'next-i18next';
import Storage from '../../utils/Storage';
import {
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
} from '@ant-design/icons';

const {
  publicRuntimeConfig: { PAGES_HOST = `${global?.location?.origin}/pages` },
} = getConfig();

interface BlockPreviewProps extends Block {}

export const BlockPreview = ({ blocks, schema, css }: BlockPreviewProps) => {
  const {
    workspace: { id: wId, slug },
  } = useWorkspace();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const storageKey = `__block_${wId}_${slug}`;
  const [values, setValues] = useState(Storage.get(storageKey));
  const { t } = useTranslation('workspaces');
  const { workspace } = useWorkspace();
  const [width, setWidth] = useState<'full' | 'tablet' | 'mobile'>('full');

  useEffect(() => {
    Storage.set(storageKey, values);
  }, [storageKey, values]);

  const update = useCallback(() => {
    if (!iframeRef.current) return;

    const appInstances = Object.entries(workspace.imports || {}).reduce<
      { slug: string; blocks: {} }[]
    >(
      (prev, [slug, { blocks }]) => [
        ...prev,
        {
          slug,
          blocks: blocks.reduce(
            (prev, { slug, ...block }) => ({ ...prev, [slug]: block }),
            {}
          ),
        },
      ],
      []
    );

    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'previewblock.update',
        page: {
          appInstances: [
            { slug: '', blocks: workspace.blocks },
            ...appInstances,
          ],
        },
        config: {
          blocks: blocks,
          css,
          ...getDefaults(schema || {}),
          ...values,
        },
      },
      '*'
    );
  }, [blocks, css, schema, values, workspace]);

  useEffect(() => {
    update();
  }, [update]);

  useEffect(() => {
    const listener = (e: MessageEvent) => {
      const { type } = e.data || {};
      if (type === 'previewblock:init') {
        update();
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, [update]);

  const cleanedSchema = useMemo(() => {
    if (schema && schema.type === 'object' && !schema.title) {
      return { ...schema, title: t('blocks.preview.config.label') };
    }
    return schema;
  }, [schema, t]);

  const [mounted, setMounted] = useState(true);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center">
        <iframe
          ref={iframeRef}
          className={`flex flex-1 ${width === 'full' ? 'w-full' : ''}
            ${width === 'tablet' ? 'w-[800px] shadow-lg' : ''}
            ${width === 'mobile' ? 'w-[420px] shadow-lg' : ''}`}
          src={`${window.location.protocol}//${slug}${PAGES_HOST}/__preview/block`}
        />
      </div>
      <div className="flex pb-6 relative">
        <div className="absolute right-0 m-2 z-10 justify-center">
          <Tooltip title={t('blocks.preview.toggleWidth.desktop')}>
            <button
              onClick={() => {
                setWidth('full');
              }}
              className="text-2xl m-2"
            >
              <DesktopOutlined
                className={width === 'full' ? '!text-accent' : ''}
              />
            </button>
          </Tooltip>
          <Tooltip title={t('blocks.preview.toggleWidth.tablet')}>
            <button
              onClick={() => {
                setWidth('tablet');
              }}
              className="text-2xl m-2"
            >
              <TabletOutlined
                className={width === 'tablet' ? '!text-accent' : ''}
              />
            </button>
          </Tooltip>
          <Tooltip title={t('blocks.preview.toggleWidth.mobile')}>
            <button
              onClick={() => {
                setWidth('mobile');
              }}
              className="text-2xl m-2"
            >
              <MobileOutlined
                className={width === 'mobile' ? '!text-accent' : ''}
              />
            </button>
          </Tooltip>
        </div>
        {cleanedSchema && cleanedSchema.type && mounted && (
          <SchemaForm
            schema={cleanedSchema}
            onChange={setValues}
            buttons={[
              <button
                key="reset"
                className="absolute bottom-2 right-4 text-sm"
                onClick={async () => {
                  setMounted(false);
                  await setValues(getDefaults(schema || {}));
                  setMounted(true);
                }}
              >
                {t('blocks.preview.config.reset')}
              </button>,
            ]}
            initialValues={values}
          />
        )}
      </div>
    </div>
  );
};

export default BlockPreview;
