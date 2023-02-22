import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import useKeyboardShortcut from '../../components/useKeyboardShortcut';
import getLayout from '../../layouts/WorkspaceLayout';
import PageRenderer from './PageRenderer';
import { PageProvider, usePage } from '../../providers/Page';
import { useWorkspace } from '../../providers/Workspace';
import { incrementName } from '../../utils/incrementName';
import { notification } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import useDirtyWarning from '../../utils/useDirtyWarning';
import { replaceSilently } from '../../utils/urls';
import { ApiError } from '../../utils/api';

const Page = () => {
  const { t } = useTranslation('workspaces');
  const { replace, push } = useRouter();
  const { page, savePage, saving, deletePage } = usePage();
  const {
    workspace: { id: workspaceId, pages = {} },
    createPage,
  } = useWorkspace();
  const [value, setValue] = useState(page);
  const [viewMode, setViewMode] = useState(
    Object.keys(page.blocks || {}).length === 0 ? 1 : 0
  );
  const [dirty] = useDirtyWarning(page, value);
  const [duplicating, setDuplicating] = useState(false);
  const duplicate = useCallback(async () => {
    if (!page.id || !page.slug) return;
    setDuplicating(true);
    const newSlug = incrementName(
      page.slug,
      Object.keys(pages).map((k) => k),
      '{{name}}-{{n}}',
      { keepOriginal: true }
    );
    const { apiKey, ...newPage } = page;
    const { slug } =
      (await createPage({
        ...newPage,
        slug: newSlug,
      })) || {};
    if (slug) {
      push(`/workspaces/${workspaceId}/pages/${slug}`);
    }
    setDuplicating(false);
    notification.success({
      message: t('pages.duplicate.success'),
      placement: 'bottomRight',
    });
  }, [createPage, page, pages, push, t, workspaceId]);

  useEffect(() => {
    setValue(page);
  }, [page]);

  const onDelete = useCallback(() => {
    replace(`/workspaces/${page.workspaceId}`);
    deletePage();
  }, [deletePage, page.workspaceId, replace]);

  const save = useCallback(async () => {
    const prevSlug = page.slug;
    try {
      const saved = await savePage(value);
      if (!saved) return;
      notification.success({
        message: t('pages.save.toast'),
        placement: 'bottomRight',
      });
      const { slug } = saved;
      if (slug !== prevSlug) {
        replaceSilently(`/workspaces/${workspaceId}/pages/${slug}`);
      }
    } catch (e) {
      const { details, error } = e as ApiError;
      const description = (
        <ul>
          {details ? (
            details.map(({ path, message }: any, key: number) => (
              <li key={key}>
                {t('openapi', {
                  context: message,
                  path: path.replace(/^\.body\./, ''),
                  ns: 'errors',
                })}
              </li>
            ))
          ) : (
            <li>{t('pages.save.reason', { context: error })}</li>
          )}
        </ul>
      );
      notification.error({
        message: t('pages.save.error'),
        description,
        placement: 'bottomRight',
      });
    }
  }, [page.slug, savePage, t, value, workspaceId]);

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
      duplicate={duplicate}
      duplicating={duplicating}
      dirty={dirty}
    />
  );
};

const PageWithProvider = () => {
  const {
    query: { pageSlug = [], id: workspaceId },
    push,
  } = useRouter();

  useEffect(() => {
    // For preview in console
    const listener = async (e: MessageEvent) => {
      const { type, href } = e.data || {};

      if (type === 'pagePreviewNavigation') {
        const [, slug] = href.match(/^\/(.+$)/) || [];
        push(`/workspaces/${workspaceId}/pages/${slug}`);
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, [push, workspaceId]);

  const slug = (Array.isArray(pageSlug) ? pageSlug : [pageSlug]).join('/');

  return (
    <PageProvider workspaceId={`${workspaceId}`} slug={`${slug}`}>
      <Page />
    </PageProvider>
  );
};
PageWithProvider.getLayout = getLayout;
export default PageWithProvider;
