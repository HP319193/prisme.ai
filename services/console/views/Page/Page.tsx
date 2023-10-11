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
import { TrackingCategory, useTracking } from '../../components/Tracking';
import {
  PagePreviewProvider,
  usePagePreview,
} from '../../components/PagePreview';
import {
  getBackTemplateDots,
  removeTemplateDots,
} from '../../utils/templatesInBlocks';

const Page = () => {
  const { t } = useTranslation('workspaces');
  const { trackEvent } = useTracking();
  const { replace, push } = useRouter();
  const { page, savePage, saving, deletePage } = usePage();
  const { reload } = usePagePreview();
  const {
    workspace: { id: workspaceId, pages = {} },
    createPage,
  } = useWorkspace();
  const [value, setValue] = useState(removeTemplateDots(page));
  const [viewMode, setViewMode] = useState(0);
  useEffect(() => {
    setViewMode(page.blocks?.length === 0 ? 1 : 0);
    setValue(removeTemplateDots(page));
  }, [page]);
  const [dirty] = useDirtyWarning(page, getBackTemplateDots(value));
  const [duplicating, setDuplicating] = useState(false);
  const duplicate = useCallback(async () => {
    if (!page.id || !page.slug) return;
    trackEvent({
      name: 'Duplicate Page',
      action: 'click',
    });
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
  }, [createPage, page, pages, push, t, trackEvent, workspaceId]);

  const onDelete = useCallback(() => {
    trackEvent({
      name: 'Delete Page',
      action: 'click',
    });
    replace(`/workspaces/${page.workspaceId}`);
    deletePage();
  }, [deletePage, page.workspaceId, replace, trackEvent]);

  const save = useCallback(async () => {
    const prevSlug = page.slug;
    trackEvent({
      name: 'Save Page',
      action: 'click',
    });
    try {
      const saved = await savePage(getBackTemplateDots(value));
      if (!saved) return;
      notification.success({
        message: t('pages.save.toast'),
        placement: 'bottomRight',
      });
      const { slug } = saved;
      if (slug !== prevSlug) {
        replaceSilently(`/workspaces/${workspaceId}/pages/${slug}`);
      }
      reload();
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
  }, [page.slug, reload, savePage, t, trackEvent, value, workspaceId]);

  useKeyboardShortcut([
    {
      key: 's',
      meta: true,
      command: (e) => {
        e.preventDefault();
        trackEvent({
          name: 'Save Page with shortcut',
          action: 'keydown',
        });
        save();
      },
    },
  ]);

  return (
    <PageRenderer
      value={value}
      onChange={(page) => setValue(getBackTemplateDots(page))}
      onDelete={onDelete}
      onSave={save}
      saving={saving}
      viewMode={viewMode}
      setViewMode={(mode) => {
        trackEvent({
          name: `Display mode ${mode === 0 ? 'Preview' : 'Edition'}`,
          action: 'click',
        });
        setViewMode(mode);
      }}
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
    <TrackingCategory category="Page Builder">
      <PageProvider workspaceId={`${workspaceId}`} slug={`${slug}`}>
        <PagePreviewProvider>
          <Page key={slug} />
        </PagePreviewProvider>
      </PageProvider>
    </TrackingCategory>
  );
};
PageWithProvider.getLayout = getLayout;
export default PageWithProvider;
