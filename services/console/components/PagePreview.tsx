import { Loading } from '@prisme.ai/design-system';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorkspace } from './WorkspaceProvider';
import getConfig from 'next/config';
import api from '../utils/api';

const {
  publicRuntimeConfig: { PAGES_HOST = '' },
} = getConfig();

interface PagePreviewProps {
  page: Prismeai.Page;
}

export const PagePreview = ({ page }: PagePreviewProps) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const pageId = useRef(page.id);
  const [loading, setLoading] = useState(true);
  const {
    workspace: { id, slug = id },
  } = useWorkspace();

  const updatePage = useCallback(() => {
    if (!ref.current || !ref.current.contentWindow) return;
    try {
      ref.current.contentWindow.postMessage(
        { type: 'updatePagePreview', page: JSON.parse(JSON.stringify(page)) },
        '*'
      );
      setLoading(false);
    } catch {}
  }, [page]);

  useEffect(() => {
    if (pageId.current !== page.id) {
      pageId.current = page.id;
      setLoading(true);
      return;
    }
    updatePage();
  }, [page, updatePage]);

  const onLoad = useCallback(() => {
    setLoading(false);
  }, []);

  const initialPage = useRef(page);
  const url = useMemo(
    () =>
      `${window.location.protocol}//${slug}${PAGES_HOST}/${
        initialPage.current.slug === 'index'
          ? ''
          : initialPage.current.slug || initialPage.current.id
      }`,
    [slug]
  );

  useEffect(() => {
    // For preview in console
    const listener = async (e: MessageEvent) => {
      const { type } = e.data || {};

      if (type === 'pageError' && e.origin.match(PAGES_HOST)) {
        ref.current?.contentWindow?.postMessage(
          { type: 'api.token', token: api.token },
          url
        );
        updatePage();
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, [updatePage, url]);

  return (
    <div className="flex flex-1 relative">
      <iframe ref={ref} src={url} className="flex flex-1" onLoad={onLoad} />
      {loading && (
        <div className="flex absolute top-0 left-0 bottom-0 right-0 items-center">
          <Loading />
        </div>
      )}
    </div>
  );
};

export default PagePreview;
