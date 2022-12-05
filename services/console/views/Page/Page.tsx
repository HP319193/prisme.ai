import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import useKeyboardShortcut from '../../components/useKeyboardShortcut';
import getLayout from '../../layouts/WorkspaceLayout';
import PageRenderer from './PageRenderer';
import { PageProvider, usePage } from '../../providers/Page';
import { useWorkspace } from '../../providers/Workspace';
import api from '../../utils/api';

const Page = () => {
  const { replace } = useRouter();
  const { page, savePage, saving, deletePage } = usePage();
  const [value, setValue] = useState(page);
  const [viewMode, setViewMode] = useState(
    Object.keys(page.blocks || {}).length === 0 ? 1 : 0
  );

  useEffect(() => {
    setValue(page);
  }, [page]);

  const onDelete = useCallback(() => {
    replace(`/workspaces/${page.workspaceId}`);
    deletePage();
  }, [deletePage, page.workspaceId, replace]);

  const save = useCallback(() => {
    savePage(value);
  }, [value, savePage]);

  useKeyboardShortcut([
    {
      key: 's',
      meta: true,
      command: (e) => {
        e.preventDefault();
        save();
      },
    },
  ]);

  return (
    <PageRenderer
      value={value}
      onChange={setValue}
      onDelete={onDelete}
      onSave={save}
      saving={saving}
      viewMode={viewMode}
      setViewMode={setViewMode}
    />
  );
};

const PageWithProvider = () => {
  const {
    query: { id: workspaceId, pageId },
    push,
  } = useRouter();
  const { workspace, refreshPage, deletePage } = useWorkspace();

  useEffect(() => {
    // For preview in console
    const listener = async (e: MessageEvent) => {
      const { type, href } = e.data || {};

      if (type === 'pagePreviewNavigation') {
        const [, slug] = href.match(/^\/(.+$)/) || [];
        if (!slug) return;
        const page = await api.getPageBySlug(
          workspace.slug || workspace.id,
          slug
        );
        if (!page) return;
        push(`/workspaces/${workspace.id}/pages/${page.id}`);
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, [push, workspace.id, workspace.slug]);

  return (
    <PageProvider
      workspaceId={`${workspaceId}`}
      id={`${pageId}`}
      onRefresh={refreshPage}
      onDelete={deletePage}
    >
      <Page />
    </PageProvider>
  );
};
PageWithProvider.getLayout = getLayout;
export default PageWithProvider;
