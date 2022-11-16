import { Loading } from '@prisme.ai/design-system';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useWorkspace } from './WorkspaceProvider';
import { generatePageUrl } from '../utils/urls';
import { Workspace } from '../utils/api';
import { useApps } from './AppsProvider';

interface PagePreviewProps {
  page: Prismeai.Page;
}

const getAppInstances = (
  workspace: Workspace,
  apps: Prismeai.DetailedAppInstance[]
) => {
  const blocks = [];
  if (workspace.blocks) {
    blocks.push({
      slug: '',
      appConfig: workspace.config,
      blocks: Object.entries(workspace.blocks).reduce(
        (prev, [slug, { url = '' }]) => ({
          ...prev,
          [slug]: url,
        }),
        {}
      ),
    });
  }
  return [
    ...blocks,
    ...Object.entries(workspace.imports || {}).map(
      ([slug, { config: appConfig }]) => ({
        slug,
        appConfig,
        blocks: Object.values(
          (apps.find(({ slug: s }) => slug === s) || { blocks: {} }).blocks
        ).reduce(
          (prev, { slug: name, url }) => ({
            ...prev,
            [`${slug}.${name}`]: url,
          }),
          {}
        ),
      })
    ),
  ];
};

export const PagePreview = ({ page }: PagePreviewProps) => {
  const { workspace } = useWorkspace();
  const { appInstances } = useApps();
  const ref = useRef<HTMLIFrameElement>(null);
  const pageId = useRef(page.id);
  const [loading, setLoading] = useState(true);
  const {
    workspace: { id, slug = id },
  } = useWorkspace();

  const updatePage = useCallback(() => {
    if (!ref.current || !ref.current.contentWindow) return;
    try {
      console.log(
        getAppInstances(workspace, appInstances.get(workspace.id) || [])
      );
      ref.current.contentWindow.postMessage(
        {
          type: 'updatePagePreview',
          page: JSON.parse(
            JSON.stringify({
              ...page,
              appInstances: getAppInstances(
                workspace,
                appInstances.get(workspace.id) || []
              ),
            })
          ),
        },
        '*'
      );
      setLoading(false);
    } catch {}
  }, [appInstances, page, workspace]);

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

  const [initialSlug, setInitialSlug] = useState(page.slug);

  useEffect(() => {
    setInitialSlug((slug) => {
      if (slug || !page.slug) return slug;
      return page.slug;
    });
  }, [page]);

  const url = useMemo(() => generatePageUrl(slug, initialSlug || ''), [
    slug,
    initialSlug,
  ]);

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
