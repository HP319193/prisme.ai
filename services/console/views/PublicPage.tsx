import { BlockProvider, Loading, Title } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Block from '../components/Block';
import SigninForm from '../components/SigninForm';
import { useUser } from '../components/UserProvider';
import api from '../utils/api';
import useLocalizedText from '../utils/useLocalizedText';
import * as BuiltinBlocks from '../components/Blocks';
import useBlocksConfigs from '../components/Blocks/useBlocksConfigs';
import ErrorBoundary from '../components/Blocks/ErrorBoundary';

export interface PublicPageProps {
  page: Prismeai.DetailedPage | null;
}

export const PublicPage = ({ page }: PublicPageProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('pages');
  const { localize } = useLocalizedText();
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState<
    Prismeai.DetailedPage | null | 401
  >(page);
  const {
    isReady,
    query: { pageSlug },
  } = useRouter();
  const { blocksConfigs, error, events } = useBlocksConfigs(page);

  useEffect(() => {
    // Page is null because it does not exist OR because it need authentication
    const fetchPage = async () => {
      try {
        const page = await api.getPageBySlug(`${pageSlug}`);
        setCurrentPage(page);
      } catch (e) {
        setCurrentPage(401);
      }
    };
    fetchPage();
  }, [pageSlug, user]);

  const blocks = useMemo(
    () =>
      currentPage && typeof currentPage === 'object'
        ? currentPage.blocks.map(({ name = '', url, config, appInstance }) => {
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
          })
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
    page.blocks.forEach(({ appInstance }) => {
      if (!appInstance) return;
      fetchAppConfig(appInstance, workspaceId);
    });
  }, [fetchAppConfig, page]);

  if (!isReady || currentPage === null) return <Loading />;

  if (currentPage === 401 || error) {
    return (
      <div className="flex flex-1 justify-center items-center flex-col">
        <Title className="!text-sm !my-8">{t('signin.title')}</Title>
        <SigninForm onSignin={(user) => console.log('user', user)} />
      </div>
    );
  }

  return (
    <div className="page flex flex-1 flex-col m-0 p-0 max-w-[100vw]">
      <Head>
        <title>{localize(currentPage.name)}</title>
        <meta name="description" content={localize(currentPage.description)} />
      </Head>
      <div className="page-blocks">
        {blocks.map(
          (
            { name = '', appInstance = '', url = '', component: Component },
            index
          ) => (
            <BlockProvider
              key={index}
              config={blocksConfigs[index]}
              appConfig={appConfigs.get(appInstance)}
              onAppConfigUpdate={updateAppConfig(appInstance)}
              events={events}
            >
              <div
                className={`page-block block-${appInstance.replace(
                  /\s/g,
                  '-'
                )} block-${name.replace(/\s/g, '-')}`}
              >
                <ErrorBoundary>
                  {Component && <Component edit={false} />}
                  {url && (
                    <Block
                      entityId={`${index}`}
                      url={url}
                      language={language}
                      token={api.token || undefined}
                      workspaceId={`${currentPage.workspaceId}`}
                      appInstance={appInstance}
                      appConfig={appConfigs.get(appInstance)}
                      setAppConfig={updateAppConfig(appInstance)}
                      events={events}
                      {...blocksConfigs[index]}
                    />
                  )}
                </ErrorBoundary>
              </div>
            </BlockProvider>
          )
        )}
      </div>
    </div>
  );
};

export default PublicPage;
