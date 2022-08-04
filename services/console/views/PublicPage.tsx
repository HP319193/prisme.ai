import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Loading, Title } from '@prisme.ai/design-system';
import SigninForm from '../components/SigninForm';
import { useUser } from '../components/UserProvider';
import api, { Events, HTTPError } from '../utils/api';
import useLocalizedText from '../utils/useLocalizedText';
import usePageBlocksConfigs from '../components/Page/usePageBlocksConfigs';
import PublicPageBlock from '../components/Page/PageBlock';

export interface PublicPageProps {
  page: Prismeai.DetailedPage | null;
  error?: number | null;
}

declare global {
  interface Window {
    Prisme: {
      ai: {
        api: typeof api;
        events?: Events;
      };
    };
  }
}

export const PublicPageRenderer = ({ page }: PublicPageProps) => {
  const { t } = useTranslation('pages');
  const { t: commonT } = useTranslation('common');
  const { localize } = useLocalizedText();
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState<Prismeai.DetailedPage | null>(
    page
  );

  const [loadingError, setLoadingError] = useState<number | null>(null);
  const {
    isReady,
    query: { pageSlug },
  } = useRouter();
  const { blocksConfigs, error, events } = usePageBlocksConfigs(currentPage);

  useEffect(() => {
    window.Prisme = window.Prisme || {};
    window.Prisme.ai = window.Prisme.ai || {};
    window.Prisme.ai.api = api;
    window.Prisme.ai.events = events;
  }, [events]);

  const containerEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // For preview in console
    const listener = (e: MessageEvent) => {
      const { type, page } = e.data;
      if (type === 'updatePagePreview') {
        setCurrentPage(page);
      }
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, []);

  useEffect(() => {
    // Page is null because it does not exist OR because it need authentication
    const fetchPage = async () => {
      try {
        const page = await api.getPageBySlug(`${pageSlug}`);
        setLoadingError(null);
        setCurrentPage(page);
      } catch (e) {
        setCurrentPage(null);
        setLoadingError((e as HTTPError).code || 404);
      }
    };
    fetchPage();
  }, [pageSlug, user]);

  const blocks = useMemo(
    () =>
      currentPage && typeof currentPage === 'object'
        ? (currentPage.blocks || []).map(
            ({ name = '', url, config, appInstance }) => {
              return {
                name,
                url,
                appInstance,
                config,
              };
            }
          )
        : [],
    [currentPage]
  );

  if (!isReady || currentPage === null) return <Loading />;

  if (typeof currentPage === 'number' && currentPage !== 401) {
    return <DefaultErrorPage statusCode={currentPage} />;
  }

  if (loadingError === 401 || error) {
    return (
      <div className="flex flex-1 justify-center items-center flex-col">
        <Title className="!text-sm !my-8">{t('signin.title')}</Title>
        <SigninForm onSignin={(user) => console.log('user', user)} />
      </div>
    );
  }

  return (
    <div className="page flex flex-1 flex-col m-0 p-0 max-w-[100vw] overflow-auto min-h-full snap-mandatory">
      <Head>
        <title>{localize(currentPage.name)}</title>
        <meta name="description" content={localize(currentPage.description)} />
      </Head>
      {currentPage.styles && (
        <style dangerouslySetInnerHTML={{ __html: currentPage.styles }} />
      )}
      <div className="absolute left-10 bottom-10 text-[0.75rem] text-pr-grey">
        {commonT('powered')}
      </div>
      <div
        className="flex flex-1 flex-col page-blocks w-full"
        ref={containerEl}
      >
        {blocks.map(({ name = '', appInstance = '', url = '' }, index) => (
          <div
            key={index}
            className={`page-block block-${appInstance.replace(
              /\s/g,
              '-'
            )} block-${name.replace(/\s/g, '-')} snap-start`}
            id={blocksConfigs[index] && blocksConfigs[index].sectionId}
          >
            <PublicPageBlock
              url={url}
              name={name}
              workspaceId={`${currentPage.workspaceId}`}
              appInstance={appInstance}
              page={currentPage}
              events={events}
              config={blocksConfigs[index]}
              container={containerEl.current || undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const PublicPage = ({
  page: pageFromServer,
  error,
}: PublicPageProps) => {
  const [page, setPage] = useState(pageFromServer);
  const [loading, setLoading] = useState(true);
  const {
    query: { pageSlug },
  } = useRouter();

  const fetchPage = useCallback(async () => {
    try {
      const page = await api.getPageBySlug(`${pageSlug}`);
      setPage(page);
    } catch (e) {}
    setLoading(false);
  }, [pageSlug]);

  useEffect(() => {
    if (pageFromServer || error !== 403) return;
    // Server didn't fetch page because it needs permissions
    // User should have them

    fetchPage();
  }, [pageSlug, error, pageFromServer, fetchPage]);

  if (!page && loading) return <Loading />;

  if (page) {
    if (page.apiKey) {
      api.apiKey = page.apiKey;
    }
    return <PublicPageRenderer page={page} />;
  }

  return (
    <div className="flex m-auto">
      <SigninForm onSignin={fetchPage} />
    </div>
  );
};

PublicPage.isPublic = true;

export default PublicPage;
