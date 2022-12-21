import DefaultErrorPage from 'next/error';
import React, { useEffect, useState } from 'react';
import { Loading } from '@prisme.ai/design-system';
import SigninForm from '../../console/components/SigninForm';
import api from '../../console/utils/api';
import PageRenderer, {
  PageProps as PageRendererProps,
} from '../components/Page/Page';
import { usePage } from '../components/Page/PageProvider';
import { useWorkspace } from '../components/Workspace';

export interface PageProps extends Omit<PageRendererProps, 'page'> {
  page: PageRendererProps['page'] | null;
}

export const Page = ({ page: pageFromServer, error }: PageProps) => {
  const { page, setPage, loading, fetchPage } = usePage();
  const { setId } = useWorkspace();
  const [displayError, setDisplayError] = useState(false);

  useEffect(() => {
    if (!page || !page.workspaceId) return;
    setId(page.workspaceId);
  }, [page, setId]);

  useEffect(() => {
    setPage(pageFromServer, error);
  }, [pageFromServer, error, setPage]);

  useEffect(() => {
    if (!loading && error && error && ![401, 403].includes(error)) {
      window.parent.postMessage('page-ready', '*');
      setTimeout(() => setDisplayError(true), 10);
    }
  }, [error, loading]);

  if (!page && loading) return <Loading />;

  if (page) {
    if (page.apiKey) {
      api.apiKey = page.apiKey;
    }
    return <PageRenderer page={page} />;
  }

  if (error && ![401, 403].includes(error)) {
    if (displayError) {
      return <DefaultErrorPage statusCode={error} />;
    }
    return <Loading />;
  }

  return (
    <div className="flex m-auto">
      <SigninForm onSignin={fetchPage} />
    </div>
  );
};

export default Page;
