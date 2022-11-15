import { useRouter } from 'next/router';
import DefaultErrorPage from 'next/error';
import React, { useCallback, useEffect, useState } from 'react';
import { Loading } from '@prisme.ai/design-system';
import SigninForm from '../../console/components/SigninForm';
import api from '../../console/utils/api';
import PageRenderer, {
  PageProps as PageRendererProps,
} from '../components/Page/Page';
import { usePage } from '../components/Page/PageProvider';

export interface PageProps extends Omit<PageRendererProps, 'page'> {
  page: PageRendererProps['page'] | null;
}

export const Page = ({ page: pageFromServer, error }: PageProps) => {
  const { page, setPage, loading, fetchPage } = usePage();

  useEffect(() => {
    setPage(pageFromServer, error);
  }, [pageFromServer, error, setPage]);

  if (!page && loading) return <Loading />;

  if (error && ![401, 403].includes(error)) {
    return <DefaultErrorPage statusCode={error} />;
  }

  if (page) {
    if (page.apiKey) {
      api.apiKey = page.apiKey;
    }
    return <PageRenderer page={page} />;
  }

  return (
    <div className="flex m-auto">
      <SigninForm onSignin={fetchPage} />
    </div>
  );
};

export default Page;