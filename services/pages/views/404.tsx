import { get } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import api from '../../console/utils/api';
import { getSubmodain } from '../../console/utils/urls';
import PageRenderer from '../components/Page/Page';
import { PageProvider } from '../components/Page/PageProvider';

// Cannot use i18next here because this page is static
const translations = {
  fr: {
    '404': `Cette page n'existe pas. Revenez à l'accueil.`,
  },
  en: {
    '404': `This page does not exist. Please return to the home page.`,
  },
};
function t(key: string) {
  const [, language] = window.location.pathname.match(/\/([a-z]{2})/) || [
    ,
    'en',
  ];
  const dico =
    translations[language as keyof typeof translations] || translations.en;
  return get(dico, key);
}

export const FourHundredOne = () => {
  const { i18n, t } = useTranslation();
  useEffect(() => {
    const [, language] = window.location.pathname.match(/\/([a-z]{2})/) || [
      ,
      'en',
    ];
    i18n.changeLanguage(language);
  });
  const [loadingCustomPage, setLoadingCustomPage] = useState(true);
  const [page, setPage] = useState<any>();

  useEffect(() => {
    async function fetch() {
      const slug = getSubmodain(window.location.host);
      try {
        const customPage = await api.getPageBySlug(slug, '_404');
        setPage(customPage);
      } catch {}
      setLoadingCustomPage(false);
    }
    fetch();
  }, [setPage]);

  if (loadingCustomPage) {
    return null;
  }

  if (page) {
    return (
      <PageProvider page={page}>
        <PageRenderer page={page} />
      </PageProvider>
    );
  }

  return <div className="flex m-auto">{t('404')}</div>;
};

export default FourHundredOne;
