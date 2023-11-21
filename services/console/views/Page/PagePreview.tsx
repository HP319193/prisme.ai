import { useWorkspace } from '../../providers/Workspace';
import getConfig from 'next/config';
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Loading, Tooltip } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import {
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
} from '@ant-design/icons';
import { useContext } from '../../utils/useContext';

const {
  publicRuntimeConfig: { PAGES_HOST = `${global?.location?.origin}/pages` },
} = getConfig();
interface PagePreviewContext {
  reload: () => void;
  mounted: boolean;
}

const pagePreviewContext = createContext<PagePreviewContext | undefined>(
  undefined
);
export const usePagePreview = () =>
  useContext<PagePreviewContext>(pagePreviewContext);

interface PagePreviewProviderProps {
  children: ReactNode;
}
export const PagePreviewProvider = ({ children }: PagePreviewProviderProps) => {
  const [mounted, setMounted] = useState(true);
  const reload = useCallback(() => {
    setMounted(false);
    setTimeout(() => setMounted(true), 1);
  }, []);
  return (
    <pagePreviewContext.Provider value={{ mounted, reload }}>
      {children}
    </pagePreviewContext.Provider>
  );
};

interface PagePreviewProps {
  page: Prismeai.Page;
  visible?: boolean;
}

export const PagePreview = ({ page, visible }: PagePreviewProps) => {
  const {
    workspace,
    workspace: { slug },
  } = useWorkspace();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { t } = useTranslation('workspaces');
  const [width, setWidth] = useState<'full' | 'tablet' | 'mobile'>('full');
  const { mounted } = usePagePreview();
  const [loaded, setLoaded] = useState(false);

  const update = useCallback(() => {
    if (!iframeRef.current || !visible) return;

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
        type: 'previewpage.update',
        page: {
          ...page,
          appInstances: [
            { slug: '', blocks: workspace.blocks },
            ...appInstances,
          ],
        },
      },
      '*'
    );
  }, [page, visible, workspace.blocks, workspace.imports]);

  useEffect(() => {
    update();
  }, [update]);

  useEffect(() => {
    const listener = (e: MessageEvent) => {
      const { type } = e.data || {};
      if (type === 'previewpage:init') {
        update();
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, [update]);

  return (
    <div className="flex flex-1 flex-col">
      {!loaded && (
        <Loading className="absolute top-0 left-0 right-0 bottom-0" />
      )}
      <div className="flex flex-1 flex-col items-center">
        {mounted && (
          <iframe
            ref={iframeRef}
            className={`flex flex-1 ${width === 'full' ? 'w-full' : ''}
            ${width === 'tablet' ? 'w-[800px] shadow-lg' : ''}
            ${width === 'mobile' ? 'w-[420px] shadow-lg' : ''}`}
            src={`${window.location.protocol}//${slug}${PAGES_HOST}/__preview/page`}
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>
      <div className="flex h-[4rem] relative">
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
      </div>
    </div>
  );
};

export default PagePreview;
