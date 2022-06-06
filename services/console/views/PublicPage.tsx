import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BlockLoader from '@prisme.ai/blocks';
import { Loading, Title } from '@prisme.ai/design-system';
import SigninForm from '../components/SigninForm';
import { useUser } from '../components/UserProvider';
import api, { HTTPError } from '../utils/api';
import useLocalizedTextConsole from '../utils/useLocalizedTextConsole';
import useBlocksConfigs from '../components/Blocks/useBlocksConfigs';

import BuiltinBlocks from '../components/Blocks/builtinBlocks';

export interface PublicPageProps {
  page: Prismeai.DetailedPage | null;
  error?: number | null;
}

export const PublicPageRenderer = ({ page }: PublicPageProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('pages');
  const { localize } = useLocalizedTextConsole();
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState<Prismeai.DetailedPage | null>(
    page
  );

  const [loadingError, setLoadingError] = useState<number | null>(null);
  const {
    isReady,
    query: { pageSlug },
  } = useRouter();
  const { blocksConfigs, error, events } = useBlocksConfigs(currentPage);

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
              if (Object.keys(BuiltinBlocks).includes(name)) {
                return {
                  name,
                  appInstance,
                  component: BuiltinBlocks[name as keyof typeof BuiltinBlocks],
                  config,
                };
              }
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

  const [appConfigs, setAppConfigs] = useState(new Map());
  const fetchAppConfig = useCallback(
    async (appInstance: string, workspaceId: string) => {
      try {
        const appConfig = await api.getAppConfig(workspaceId, appInstance);
        setAppConfigs((appConfigs) => {
          const newAppConfigs = new Map(appConfigs);
          newAppConfigs.set(appInstance, appConfig);
          return newAppConfigs;
        });
      } catch {
        return;
      }
    },
    []
  );
  const updateAppConfig = useCallback(
    (appInstance: string) => async (value: any) => {
      if (!page || !page.workspaceId) return;
      setAppConfigs((appConfigs) => {
        const newAppConfigs = new Map(appConfigs);
        newAppConfigs.set(appInstance, value);
        return newAppConfigs;
      });
      await api.updateAppConfig(page.workspaceId, appInstance, value);
    },
    [page]
  );
  useEffect(() => {
    if (!page || !page.workspaceId) return;
    const { workspaceId } = page;
    (page.blocks || []).forEach(({ appInstance }) => {
      if (!appInstance) return;
      fetchAppConfig(appInstance, workspaceId);
    });
  }, [fetchAppConfig, page]);

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
    <div className="page flex flex-1 flex-col m-0 p-0 max-w-[100vw] overflow-scroll min-h-full">
      <Head>
        <title>{localize(currentPage.name)}</title>
        <meta name="description" content={localize(currentPage.description)} />
      </Head>
      {currentPage.styles && (
        <style dangerouslySetInnerHTML={{ __html: currentPage.styles }} />
      )}
      <div className="flex flex-1 flex-col page-blocks w-full">
        {blocks.map(
          (
            { name = '', appInstance = '', url = '', component: Component },
            index
          ) => (
            <div
              key={index}
              className={`page-block block-${appInstance.replace(
                /\s/g,
                '-'
              )} block-${name.replace(/\s/g, '-')}`}
              id={blocksConfigs[index] && blocksConfigs[index].sectionId}
            >
              <BlockLoader
                entityId={`${index}`}
                url={url}
                language={language}
                token={api.token || undefined}
                workspaceId={`${currentPage.workspaceId}`}
                appInstance={appInstance}
                appConfig={appConfigs.get(appInstance)}
                setAppConfig={updateAppConfig(appInstance)}
                events={events}
                config={blocksConfigs[index]}
                onAppConfigUpdate={updateAppConfig(appInstance)}
                api={api}
                {...blocksConfigs[index]}
              >
                {Component && <Component edit={false} />}
              </BlockLoader>
            </div>
          )
        )}
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

  if (page) return <PublicPageRenderer page={page} />;

  return (
    <div className="flex m-auto">
      <SigninForm onSignin={fetchPage} />
    </div>
  );
};

PublicPage.isPublic = true;

export default PublicPage;
