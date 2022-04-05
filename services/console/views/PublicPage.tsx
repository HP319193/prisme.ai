import { BlockProvider, Loading, Title } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';
import Block from '../components/Block';
import SigninForm from '../components/SigninForm';
import { useUser } from '../components/UserProvider';
import api, { Events } from '../utils/api';
import useLocalizedText from '../utils/useLocalizedText';
import * as BuiltinBlocks from '../components/Blocks';
import { useWorkspace } from '../layouts/WorkspaceLayout';

export interface PublicPageProps {
  page: Prismeai.DetailedPage | null;
}

export const PublicPage = ({ page }: PublicPageProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('pages');
  const localize = useLocalizedText();
  const { user } = useUser();
  const [currentPage, setCurrentPage] = useState<
    Prismeai.DetailedPage | null | 401
  >(page);
  const {
    isReady,
    query: { pageSlug },
  } = useRouter();
  const [widgetsConfigs, setWidgetsConfigs] = useState<any[]>([]);

  useEffect(() => {
    if (!page) return;
    setWidgetsConfigs(page.widgets.map(({ config }) => config));
  }, [page]);

  const socket = useRef<Events>();
  useEffect(() => {
    if (!page || !page.workspaceId) return;
    const socketAlreadyInstantiatedForId =
      socket.current && socket.current.workspaceId === page.workspaceId;

    if (!page.workspaceId || socketAlreadyInstantiatedForId) {
      return;
    }
    if (socket.current) {
      socket.current.destroy();
    }
    socket.current = api.streamEvents(page.workspaceId);
    const off = socket.current.all((e, { payload }) => {
      const updateEvents = page.widgets.reduce<Record<string, number[]>>(
        (prev, { config }, index) =>
          !config || !config.updateOn
            ? prev
            : {
                ...prev,
                [config.updateOn]: [...(prev[config.updateOn] || []), index],
              },
        {}
      );

      if (Object.keys(updateEvents).includes(e)) {
        setWidgetsConfigs((configs) => {
          const newConfigs = [...configs];
          (updateEvents[e] || []).forEach((id) => {
            newConfigs[id] = payload;
          });
          return newConfigs;
        });
      }
      // http://localhost:3001/v2/workspaces/eQa1CHo/webhooks/update page title
    });

    return () => {
      off();
    };
  }, [page]);
  console.log(widgetsConfigs);
  // Init widgets
  useEffect(() => {
    if (!page || !page.workspaceId) return;
    const initEvents = page.widgets.reduce<string[]>(
      (prev, { config }) =>
        !config || !config.onInit ? prev : [...prev, config.onInit],
      []
    );
    api.postEvents(
      page.workspaceId,
      initEvents.map((event) => ({
        type: event,
        payload: {
          page: page.id,
        },
      }))
    );
  }, [page]);

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

  const widgets = useMemo(
    () =>
      currentPage && typeof currentPage === 'object'
        ? currentPage.widgets.map(({ name = '', url, config, appInstance }) => {
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

  if (!isReady || currentPage === null) return <Loading />;

  if (currentPage === 401) {
    return (
      <div className="flex flex-1 justify-center items-center flex-col">
        <Title className="!text-sm !my-8">{t('signin.title')}</Title>
        <SigninForm onSignin={(user) => console.log('user', user)} />
      </div>
    );
  }

  return (
    <div className="page flex flex-1 flex-col m-2">
      <Head>
        <title>{localize(currentPage.name)}</title>
        <meta name="description" content={localize(currentPage.description)} />
      </Head>
      <div className="page-blocks">
        {widgets.map(
          (
            { name = '', appInstance = '', url = '', component: Component },
            index
          ) => (
            <BlockProvider
              key={index}
              config={widgetsConfigs[index]}
              appConfig={{}}
            >
              <div
                className={`page-block block-${appInstance.replace(
                  /\s/g,
                  '-'
                )} block-${name.replace(/\s/g, '-')}`}
              >
                {Component && <Component />}
                {url && (
                  <Block
                    entityId={`${index}`}
                    url={url}
                    language={language}
                    token={api.token || undefined}
                    workspaceId={`${currentPage.workspaceId}`}
                    appInstance={appInstance}
                  />
                )}
              </div>
            </BlockProvider>
          )
        )}
      </div>
    </div>
  );
};

export default PublicPage;
