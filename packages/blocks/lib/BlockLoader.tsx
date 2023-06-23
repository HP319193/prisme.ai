import './i18n';
import {
  ReactElement,
  ReactNode,
  useState,
  useEffect,
  useRef,
  Component,
  useCallback,
} from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { BlockProvider, BlockProviderProps } from './Provider';
import { useBlocks } from './Provider/blocksContext';
import * as builtinBlocks from './Blocks';
import { Schema } from '@prisme.ai/design-system';
import useExternalModule from './utils/useExternalModule';
import i18n from './i18n';

class BlockErrorBoundary extends Component<{ children: ReactElement }> {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

export interface BlockComponentProps<T = any> {
  name?: string;
  token?: string;
  workspaceId?: string;
  appInstance?: string;
  language?: string;
  layout?: {
    container?: HTMLElement;
  };
  config?: T;
}
export type BlockComponent<T = any> = {
  (props: BlockComponentProps<T>): ReactElement | null;
  schema?: Schema;
  Preview?: (props: BlockComponentProps<T>) => ReactElement;
  styles?: string;
};

export interface BlockLoaderProps extends BlockComponentProps {
  children?: ReactNode;
  url?: string;
  onLoad?: (block: any) => void;
}

export const ReactBlock = ({
  url = '',
  onLoad,
  ...componentProps
}: BlockLoaderProps) => {
  const {
    i18n: { language },
  } = useTranslation('workspaces');
  const {
    externals,
    components: { Loading },
  } = useBlocks();

  const { module: Component, loading } = useExternalModule({
    url,
    externals,
  });

  useEffect(() => {
    if (!onLoad || !module || loading) return;
    onLoad(module);
  }, [onLoad, module, loading]);

  return (
    <>
      {loading && <Loading />}
      {Component && <Component {...componentProps} language={language} />}
    </>
  );
};

export const IFrameBlock = ({ url, token }: BlockLoaderProps) => {
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(100);
  const {
    components: { Loading },
  } = useBlocks();
  const handleLoad = useCallback(
    (e: any) => {
      setLoading(false);
      e.target.contentWindow.postMessage(
        {
          source: 'prisme.ai',
          token,
        },
        '*'
      );
    },
    [token]
  );

  return (
    <>
      {loading && <Loading />}
      <iframe
        src={url}
        onLoad={handleLoad}
        className="flex"
        style={{
          width: '100%',
          height: `${height}px`,
        }}
      />
    </>
  );
};

const getComponentByName = (name: string): BlockComponent | null =>
  (builtinBlocks[name as keyof typeof builtinBlocks] as BlockComponent) || null;

const BuiltinBlock = ({
  name,
  onLoad,
  Component,
  ...props
}: BlockLoaderProps & { name: string; Component: BlockComponent }) => {
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || !onLoad) return;
    loaded.current = true;
    onLoad(Component);
  }, []);
  return Component ? <Component {...props} /> : null;
};

const BlockRenderMethod = ({ name, url, ...props }: BlockLoaderProps) => {
  if (name) {
    const Component = getComponentByName(name);
    if (Component) {
      return <BuiltinBlock Component={Component} name={name} {...props} />;
    }
  }

  if (typeof window === 'undefined') {
    // SSR, return nothing
    return null;
  }

  const isJs = url && url.replace(/\?.*$/, '').match(/\.js$/);

  if (isJs) {
    return <ReactBlock url={url} name={name} {...props} />;
  }

  if (url?.match(/^http/)) {
    return <IFrameBlock url={url} {...props} />;
  }

  return null;
};

export const BlockLoader = ({
  config,
  onConfigUpdate,
  onAppConfigUpdate,
  api,
  language,
  ...props
}: BlockProviderProps & BlockLoaderProps) => {
  useEffect(() => {
    if (i18n.language === language) return;
    i18n.changeLanguage(language);
  }, [language]);

  return (
    <BlockErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <BlockProvider
          config={config}
          onConfigUpdate={onConfigUpdate}
          appConfig={props.appConfig}
          onAppConfigUpdate={onAppConfigUpdate}
          events={props.events}
          api={api}
          onLoad={props.onLoad}
        >
          <BlockRenderMethod {...props} />
        </BlockProvider>
      </I18nextProvider>
    </BlockErrorBoundary>
  );
};
