import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import SigninForm from '../../console/components/SigninForm';
import api from '../../console/utils/api';
import { getSubmodain } from '../../console/utils/urls';
import PageRenderer from '../components/Page/Page';
import { usePage } from '../components/Page/PageProvider';

export const FourHundredOne = () => {
  const { t } = useTranslation('sign');
  const { setPage, page } = usePage();

  const [loadingCustomPage, setLoadingCustomPage] = useState(true);

  useEffect(() => {
    async function fetch() {
      const slug = getSubmodain(window.location.host);
      try {
        const customPage = await api.getPageBySlug(slug, '_401');
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
    return <PageRenderer page={page} />;
  }

  return (
    <div className="flex m-auto">
      <SigninForm onSignin={(user) => {}} show403={t('pages.restricted')} />
    </div>
  );
};

export default FourHundredOne;
