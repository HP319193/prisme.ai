import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Error404 from '../Errors/404';
import { useTranslation } from 'next-i18next';
import cloneDeep from 'lodash/cloneDeep';
import { Loading, notification } from '@prisme.ai/design-system';
import { PageBuilderContext } from '../../components/PageBuilder/context';
import { usePages } from '../../components/PagesProvider';
import useKeyboardShortcut from '../../components/useKeyboardShortcut';
import { useWorkspace } from '../../components/WorkspaceProvider';
import getLayout from '../../layouts/WorkspaceLayout';
import { useWorkspaceLayout } from '../../layouts/WorkspaceLayout/context';
import api from '../../utils/api';
import PageRenderer from './PageRenderer';
import { cleanValue } from './cleanValue';

export const Page = () => {
  const { t } = useTranslation('workspaces');
  const [viewMode, setViewMode] = useState(0);
  const { workspace } = useWorkspace();
  const { setDirty } = useWorkspaceLayout();
  const { savePage, deletePage } = usePages();
  const [page, setPage] = useState<Prismeai.Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState<Prismeai.Page>();
  const [saving, setSaving] = useState(false);
  const [eventsInPage, setEventsInPage] = useState<string[]>([]);

  const {
    query: { id: workspaceId, pageId },
    push,
  } = useRouter();
  const prevPageId = useRef('');

  useEffect(() => {
    const fetchPage = async () => {
      if (!workspaceId || !pageId) return;
      setLoading(true);
      try {
        const { appInstances, ...page } = await api.getPage(
          `${workspaceId}`,
          `${pageId}`
        );
        setViewMode((page?.blocks || []).length === 0 ? 1 : 0);
        setPage(page);
        setValue(page);
        setDirty(false);
      } catch {}
      setLoading(false);
    };
    fetchPage();
  }, [pageId, setDirty, workspaceId]);

  useEffect(() => {
    if (!value || !page || value.id !== page.id || saving) {
      setDirty(false);
      return;
    }
    const clonedValue = cloneDeep(value) as PageBuilderContext['page'];
    if (clonedValue && clonedValue.blocks) {
      clonedValue.blocks.forEach((block) => {
        delete block.key;
      });
    }

    if (
      pageId === prevPageId.current &&
      JSON.stringify(page) !== JSON.stringify(clonedValue)
    ) {
      setDirty(true);
    }
  }, [value, pageId, prevPageId, setDirty, page, saving]);

  const save = useCallback(async () => {
    if (!value || !page || !page.id) return;
    setSaving(true);
    try {
      await savePage(workspace.id, cleanValue(value, page.id), eventsInPage);
      setDirty(false);
      notification.success({
        message: t('pages.save.toast'),
        placement: 'bottomRight',
      });
    } catch (e) {
      notification.error({
        message: t('pages.save.error'),
        placement: 'bottomRight',
      });
    }
    setSaving(false);
  }, [eventsInPage, page, savePage, setDirty, t, value, workspace.id]);

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

  const onDelete = useCallback(async () => {
    await push(`/workspaces/${workspace.id}`);

    deletePage(workspace.id, `${pageId}`);
    notification.success({
      message: t('pages.delete.toast'),
      placement: 'bottomRight',
    });
  }, [deletePage, pageId, push, t, workspace]);

  useEffect(() => {
    // For preview in console
    const listener = async (e: MessageEvent) => {
      const { type, href } = e.data || {};
      if (type === 'pagePreviewNavigation') {
        const [, slug] = href.match(/^\/(.+$)/);
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

  if (loading) {
    return <Loading />;
  }

  if (!page) {
    return <Error404 link={`/workspaces/${workspace.id}`} />;
  }

  if (!value) return <Loading />;

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

Page.getLayout = getLayout;

export default Page;
