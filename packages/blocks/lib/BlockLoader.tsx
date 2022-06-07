import './i18n';
import * as React from 'react';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { useTranslation } from 'react-i18next';
import {
  Block as TBlock,
  BlockProvider,
  BlockProviderProps,
  useBlocks,
} from './Provider';
import * as builtinBlocks from './Blocks';

class BlockErrorBoundary extends React.Component {
  state = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Vous pouvez aussi enregistrer l'erreur au sein d'un service de rapport.
    console.error(error, errorInfo);
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
}
type BlockComponent = (props: BlockComponentProps) => ReactElement;

export interface BlockLoaderProps extends BlockComponentProps {
  children?: ReactNode;
  url?: string;
  name?: string;
  renderLoading?: ReactElement;
  onLoad?: (block: any) => void;
}

export const ReactBlock = ({
  url,
  renderLoading,
  onLoad,
  ...props
}: BlockLoaderProps) => {
  const {
    i18n: { language },
  } = useTranslation('workspaces');
  const [loading, setLoading] = useState(true);
  const { externals } = useBlocks();

  useEffect(() => {
    // @ts-ignore
    if (process.browser) {
      // @ts-ignore
      window.__external = window.__external || externals;
    }
  });

  const [Component, setComponent] = useState<BlockComponent | null>(null);
  useEffect(() => {
    const uniqMethod = `__load_${nanoid()}`;
    // @ts-ignore
    window[uniqMethod] = (module) => {
      setComponent(() => {
        return module.default;
      });
      loading && onLoad && onLoad(module.default);
      setLoading(false);
    };
    const s = document.createElement('script');

    s.innerHTML = `
    import * as module from '${url}';
    try {
      window['${uniqMethod}'](module);
    } catch (e) {}
    `;
    s.type = 'module';
    document.body.appendChild(s);

    return () => {
      // @ts-ignore
      delete window[uniqMethod];
      document.body.removeChild(s);
    };
  }, [onLoad, url]);

  return (
    <>
      {(loading && renderLoading) || null}
      {Component && <Component {...props} language={language} />}
    </>
  );
};

export const IFrameBlock = ({
  url,
  token,
  renderLoading,
}: BlockLoaderProps) => {
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(100);
  const handleLoad = React.useCallback(
    (e) => {
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
  // useEffect(() => {
  //   const listener = (e: MessageEvent) => {
  //     if (e.data.source === entityId) {
  //       Object.keys(e.data).forEach((method) => {
  //         switch (method) {
  //           case 'init':
  //             setHeight(+e.data[method].height);
  //         }
  //       });
  //     }
  //   };
  //   window.addEventListener('message', listener);
  //
  //   return () => {
  //     window.removeEventListener('message', listener);
  //   };
  // }, [entityId, height]);

  return (
    <>
      {(loading && renderLoading) || null}
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

const getComponentByName = (name: string) => {
  switch (name) {
    case 'Cards':
      return builtinBlocks.Cards;
    case 'DataTable':
      return builtinBlocks.DataTable;
    case 'Development':
      return builtinBlocks.Development;
    case 'Form':
      return builtinBlocks.Form;
    case 'Header':
      return builtinBlocks.Header;
    default:
      return null;
  }
};

const BlockRenderMethod = ({ name, url, ...props }: BlockLoaderProps) => {
  if (name) {
    const Component = getComponentByName(name);
    if (Component) {
      return <Component edit={!!props.edit} />;
    }
  }

  const isJs = url && url.replace(/\?.*$/, '').match(/\.js$/);
  if (isJs) {
    // TODO ajouter un provider ici
    return (
      <BlockErrorBoundary>
        <ReactBlock url={url} {...props} />
      </BlockErrorBoundary>
    );
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
    <BlockProvider
      config={config}
      onConfigUpdate={onConfigUpdate}
      appConfig={props.appConfig}
      onAppConfigUpdate={onAppConfigUpdate}
      events={props.events}
      api={api}
    >
      <BlockRenderMethod {...props} />
    </BlockProvider>
  );
};
