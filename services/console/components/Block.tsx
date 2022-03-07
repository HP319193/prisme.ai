import * as React from 'react';
import * as prismeaiDS from '@prisme.ai/design-system';
import { ReactElement, useEffect, useState } from 'react';
import { nanoid } from 'nanoid';

// @ts-ignore
window.__external = window.__external || {
  React,
  prismeaiDS,
};
// @ts-ignore
window.__external.React.default = React;

interface BlockComponentProps {
  entityId: string;
}
type BlockComponent = (props: BlockComponentProps) => ReactElement;

interface BlockProps extends BlockComponentProps {
  url: string;
  renderLoading?: ReactElement;
  token?: string;
}

export const ReactBlock = ({ url, renderLoading, ...props }: BlockProps) => {
  const [loading, setLoading] = useState(true);

  const [Component, setComponent] = useState<BlockComponent | null>(null);
  useEffect(() => {
    const uniqMethod = `__load_${nanoid()}`;
    // @ts-ignore
    window[uniqMethod] = (module) => {
      console.log('module', module);
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
      {Component && <Component {...props} />}
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
    [entityId]
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
    return <ReactBlock url={url} {...props} />;
  }
  return <IFrameBlock url={url} {...props} />;
};

export default Block;
