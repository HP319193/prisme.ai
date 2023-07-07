import { Block } from '../../providers/Block';
import { useWorkspace } from '../../providers/Workspace';
import getConfig from 'next/config';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SchemaForm } from '@prisme.ai/design-system';
import { getDefaults } from './getDefaults';
import { useTranslation } from 'next-i18next';
import Storage from '../../utils/Storage';

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

  useEffect(() => {
    Storage.set(storageKey, values);
  }, [storageKey, values]);

  const update = useCallback(() => {
    if (!iframeRef.current) return;

    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'previewblock.update',
        page: {
          appInstances: [{ slug: '', blocks: workspace.blocks }],
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
      <iframe
        ref={iframeRef}
        className="flex flex-1"
        src={`${window.location.protocol}//${slug}${PAGES_HOST}/__preview/block`}
      />
      {cleanedSchema && mounted && (
        <div className="flex pb-6">
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
        </div>
      )}
    </div>
  );
};

export default BlockPreview;
