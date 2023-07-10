import { useEffect, useState } from 'react';
import BlockLoader from '../components/Page/BlockLoader';
import { usePage } from '../components/Page/PageProvider';

export const BlockPreview = () => {
  const [config, setConfig] = useState({});
  const { setPage } = usePage();
  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (e.data.type === 'previewblock.update') {
        const { page, config: { blocks = [], css = '', ...config } = {} } =
          e.data;
        setPage(page);
        setConfig({ blocks, css, ...config });
      }
    };
    window.addEventListener('message', listener);
    window.parent.postMessage({ type: 'previewblock:init' }, '*');
    return () => {
      window.removeEventListener('message', listener);
    };
  }, [setPage]);

  // This make force load css at runtime
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="page flex flex-1 flex-col m-0 p-0 max-w-[100vw] min-h-full">
      <div className="flex flex-1 flex-col page-blocks w-full">
        <BlockLoader name="BlocksList" config={config} />
      </div>
    </div>
  );
};
export default BlockPreview;
