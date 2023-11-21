import { Block } from '../../providers/Block';
import { useWorkspace } from '../../providers/Workspace';
import getConfig from 'next/config';
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Tooltip } from '@prisme.ai/design-system';
import { getDefaults } from './getDefaults';
import { useTranslation } from 'next-i18next';
import Storage from '../../utils/Storage';
import {
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
} from '@ant-design/icons';
import { useContext } from '../../utils/useContext';
import useLocalizedText from '../../utils/useLocalizedText';
import SchemaForm from '../../components/SchemaForm/SchemaForm';
import BlocksListEditorProvider from '../../components/BlocksListEditor/BlocksListEditorProvider';

const {
  publicRuntimeConfig: { PAGES_HOST = `${global?.location?.origin}/pages` },
} = getConfig();
interface BlockPreviewContext {
  reload: () => void;
  mounted: boolean;
}

const blockPreviewContext = createContext<BlockPreviewContext | undefined>(
  undefined
);
export const useBlockPreview = () =>
  useContext<BlockPreviewContext>(blockPreviewContext);

interface BlockPreviewProviderProps {
  children: ReactNode;
}
export const BlockPreviewProvider = ({
  children,
}: BlockPreviewProviderProps) => {
  const [mounted, setMounted] = useState(true);
  const reload = useCallback(() => {
    setMounted(false);
    setTimeout(() => setMounted(true), 1);
  }, []);
  return (
    <blockPreviewContext.Provider value={{ mounted, reload }}>
      {children}
    </blockPreviewContext.Provider>
  );
};

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
  const { mounted } = useBlockPreview();
  const { localizeSchemaForm } = useLocalizedText();

  useEffect(() => {
    Storage.set(storageKey, values);
  }, [storageKey, values]);

  const update = useCallback(() => {
    if (!iframeRef.current) return;

    const appInstances = Object.entries(workspace.imports || {}).reduce<
      { slug: string; blocks: {} }[]
    >(
      (prev, [slug, { blocks = [] }]) => [
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
    if (!schema) return schema;
    return localizeSchemaForm(schema);
  }, [localizeSchemaForm, schema, t]);

  const [formMounted, setFormMounted] = useState(true);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center">
        {mounted && (
          <iframe
            ref={iframeRef}
            className={`flex flex-1 ${width === 'full' ? 'w-full' : ''}
            ${width === 'tablet' ? 'w-[800px] shadow-lg' : ''}
            ${width === 'mobile' ? 'w-[420px] shadow-lg' : ''}`}
            src={`${window.location.protocol}//${slug}${PAGES_HOST}/__preview/block`}
          />
        )}
      </div>
      <div className="flex pb-6 relative">
        <div className="absolute right-6 m-2 z-10 justify-center">
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
        <div className="flex flex-1 min-h-[4rem]">
          {cleanedSchema && cleanedSchema.type && formMounted && (
            <BlocksListEditorProvider>
              <SchemaForm
                schema={cleanedSchema}
                onChange={setValues}
                buttons={[
                  <button
                    key="reset"
                    className="absolute bottom-2 right-4 text-sm"
                    onClick={async () => {
                      setFormMounted(false);
                      await setValues(getDefaults(schema || {}));
                      setFormMounted(true);
                    }}
                  >
                    {t('blocks.preview.config.reset')}
                  </button>,
                ]}
                initialValues={values}
              />
            </BlocksListEditorProvider>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockPreview;
