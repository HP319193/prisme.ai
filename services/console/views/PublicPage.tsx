import { Loading } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Block from '../components/Block';
import api from '../utils/api';
import useLocalizedText from '../utils/useLocalizedText';

export interface PublicPageProps {
  page: Prismeai.DetailedPage | null;
}

export const PublicPage = ({ page }: PublicPageProps) => {
  const {
    i18n: { language },
  } = useTranslation('pages');
  const localize = useLocalizedText();
  const [currentPage, setCurrentPage] = useState<
    Prismeai.DetailedPage | null | 401
  >(page);
  const [favicon, setFavicon] = useState('');
  const {
    isReady,
    query: { pageSlug },
  } = useRouter();

  useEffect(() => {
    if (currentPage) return;
    // Page is null because it does not exist OR because it need authentication
    const fetchPage = async () => {
      try {
        const page = await api.getPageBySlug(`${pageSlug}`);
        setCurrentPage(page);
        if (!page.workspaceId) return;
        const workspace = await api.getWorkspace(page.workspaceId);
        if (!workspace || !workspace.photo) return;
        setFavicon(workspace.photo);
      } catch (e) {
        setCurrentPage(401);
      }
    };
    fetchPage();
  }, [currentPage, pageSlug]);

  if (!isReady || currentPage === null) return <Loading />;

  if (currentPage === 401) {
    return <div>Accès restreint</div>;
  }
  return (
    <div className="page flex flex-1 flex-col m-2">
      <Head>
        <title>{localize(currentPage.name)}</title>
        <meta name="description" content={localize(currentPage.description)} />
        {favicon && <link rel="icon" href={favicon} />}
      </Head>
      <div className="page-blocks">
        {currentPage.widgets.map(
          ({ name = '', appInstance = '', url = '' }, index) => (
            <div
              key={index}
              className={`page-block block-${appInstance.replace(
                /\s/g,
                '-'
              )} block-${name.replace(/\s/g, '-')}`}
            >
              <Block
                entityId={`${index}`}
                url={url}
                language={language}
                token={api.token || undefined}
                workspaceId={`${currentPage.workspaceId}`}
                appInstance={appInstance}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};

PublicPage.isPublic = true;

export default PublicPage;
