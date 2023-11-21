import { useEffect, useState } from 'react';
import { usePage } from '../components/Page/PageProvider';
import Page from './Page';

export const PagePreview = () => {
  const { setPage } = usePage();
  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (e.data.type === 'previewpage.update') {
        const { page } = e.data;
        setPage(page);
      }
    };
    window.addEventListener('message', listener);
    window.parent.postMessage({ type: 'previewpage:init' }, '*');
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

  return <Page />;
};
export default PagePreview;
