import DefaultErrorPage from 'next/error';
import React, { useEffect, useState } from 'react';
import { Loading } from '@prisme.ai/design-system';
import api from '../../console/utils/api';
import PageRenderer, {
  PageProps as PageRendererProps,
} from '../components/Page/Page';
import { usePage } from '../components/Page/PageProvider';
import { useWorkspace } from '../components/Workspace';
import { useRouter } from 'next/router';
import SigninForm from '../../console/components/SigninForm';
import { useTranslation } from 'next-i18next';

export interface PageProps extends Omit<PageRendererProps, 'page'> {
  page: PageRendererProps['page'] | null;
}

export const Page = () => {
  const { t } = useTranslation('sign');
  const { page, error, loading } = usePage();
  const { setId } = useWorkspace();
  const [displayError, setDisplayError] = useState(false);
  useEffect(() => {
    if (!page || !page.workspaceId) return;
    setId(page.workspaceId);
  }, [page, setId]);

  useEffect(() => {
    window.parent.postMessage('page-ready', '*');
    if (!loading && error && error && ![401, 403].includes(error)) {
      setTimeout(() => setDisplayError(true), 10);
    }
  }, [error, loading]);

  if (!page && loading) return <Loading />;

  if (page) {
    if (page.apiKey) {
      api.apiKey = page.apiKey;
    }
    return <PageRenderer page={page} error={error} />;
  }

  if (error && ![401, 403].includes(error)) {
    if (displayError) {
      return <DefaultErrorPage statusCode={error} />;
    }
    return <Loading />;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div className="flex m-auto">
      <SigninForm onSignin={(user) => {}} show403={t('pages.restricted')} />
    </div>
  );
};

export default Page;
