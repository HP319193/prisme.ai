import './i18n';
import * as React from 'react';
import { ReactElement, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BlockProvider, BlockProviderProps } from './Provider';
import { useBlocks } from './Provider/blocksContext';
import * as builtinBlocks from './Blocks';
import { Schema } from '@prisme.ai/design-system';
import useExternalModule from './utils/useExternalModule';

class BlockErrorBoundary extends React.Component<{ children: ReactElement }> {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Vous pouvez aussi enregistrer l'erreur au sein d'un service de rapport.console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Vous pouvez afficher n'importe quelle UI de repli.
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export interface BlockComponentProps {
  token?: string;
  workspaceId?: string;
  appInstance?: string;
  language?: string;
  edit?: boolean;
  layout?: {
    container?: HTMLElement;
  };
}
export type BlockComponent = (
  props: BlockComponentProps
) => ReactElement & {
  schema?: Schema;
};

export interface BlockLoaderProps extends BlockComponentProps {
  children?: ReactNode;
  url?: string;
  name?: string;
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

  React.useEffect(() => {
    if (!onLoad || !module || loading) return;
    onLoad(module);
  }, [onLoad, module, loading]);

  return (
    <>
      {loading && componentProps.edit && <Loading />}
      {Component && <Component {...componentProps} language={language} />}
    </>
  );
};

export const IFrameBlock = ({ url, token, edit }: BlockLoaderProps) => {
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(100);
  const {
    components: { Loading },
  } = useBlocks();
  const handleLoad = React.useCallback(
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
      {loading && edit && <Loading />}
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

const getComponentByName = (name: string) =>
  builtinBlocks[name as keyof typeof builtinBlocks] || null;

const BlockRenderMethod = ({ name, url, ...props }: BlockLoaderProps) => {
  if (name) {
    const Component = getComponentByName(name);
    if (Component) {
      return <Component edit={!!props.edit} {...props} />;
    }
  }

  const isJs = url && url.replace(/\?.*$/, '').match(/\.js$/);
  if (isJs) {
    return <ReactBlock url={url} {...props} />;
  }

  return <IFrameBlock url={url} {...props} />;
};

export const BlockLoader = ({
  config,
  onConfigUpdate,
  onAppConfigUpdate,
  api,
  ...props
}: BlockProviderProps & BlockLoaderProps) => {
  return (
    <BlockErrorBoundary>
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
    </BlockErrorBoundary>
  );
};
