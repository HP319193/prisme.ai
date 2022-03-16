import * as React from 'react';
import * as prismeaiDS from '@prisme.ai/design-system';
import * as prismeaiSDK from '../utils/api';
import { ReactElement, useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { useTranslation } from 'next-i18next';

if (process.browser) {
  // @ts-ignore
  window.__external = window.__external || {
    React: { ...React, default: React },
    prismeaiDS,
    prismeaiSDK,
  };
}

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

interface BlockComponentProps {
  entityId: string;
  token?: string;
  workspaceId?: string;
  appInstance?: string;
  language?: string;
}
type BlockComponent = (props: BlockComponentProps) => ReactElement;

interface BlockProps extends BlockComponentProps {
  url: string;
  renderLoading?: ReactElement;
}

export const ReactBlock = ({ url, renderLoading, ...props }: BlockProps) => {
  const {
    i18n: { language },
  } = useTranslation('workspaces');
  const [loading, setLoading] = useState(true);

  const [Component, setComponent] = useState<BlockComponent | null>(null);
  useEffect(() => {
    const uniqMethod = `__load_${nanoid()}`;
    // @ts-ignore
    window[uniqMethod] = (module) => {
      setComponent(() => {
        return module.default;
      });
      setLoading(false);
    };
    const s = document.createElement('script');

    s.innerText = `
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
    };
  }, [url]);

  return (
    <>
      {(loading && renderLoading) || null}
      {Component && <Component {...props} language={language} />}
    </>
  );
};

export const IFrameBlock = ({
  url,
  entityId,
  token,
  renderLoading,
}: BlockProps) => {
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(100);
  const handleLoad = React.useCallback(
    (e) => {
      setLoading(false);
      e.target.contentWindow.postMessage(
        {
          source: 'prisme.ai',
          token,
          id: entityId,
        },
        '*'
      );
    },
    [entityId, token]
  );
  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (e.data.source === entityId) {
        Object.keys(e.data).forEach((method) => {
          switch (method) {
            case 'init':
              setHeight(+e.data[method].height);
          }
        });
      }
    };
    window.addEventListener('message', listener);

    return () => {
      window.removeEventListener('message', listener);
    };
  }, [entityId, height]);

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

export const Block = ({ url, ...props }: BlockProps) => {
  const isJs = url.match(/\.js$/);
  if (isJs) {
    return (
      <BlockErrorBoundary>
        <ReactBlock url={url} {...props} />
      </BlockErrorBoundary>
    );
  }
  return <IFrameBlock url={url} {...props} />;
};

export default Block;
