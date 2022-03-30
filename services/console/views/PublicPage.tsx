import { Loading, Title } from '@prisme.ai/design-system';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Block from '../components/Block';
import SigninForm from '../components/SigninForm';
import { useUser } from '../components/UserProvider';
import api from '../utils/api';
import useLocalizedText from '../utils/useLocalizedText';

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

export default PublicPage;
