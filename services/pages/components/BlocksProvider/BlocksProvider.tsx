import { BlocksProvider as Provider } from '@prisme.ai/blocks';
import { FC, useCallback, useMemo } from 'react';
import externals from '../../../console/utils/externals';
import { useWorkspace } from '../Workspace';
import api from '../../../console/utils/api';
import { getPreview } from './getPreview';
import Link from './Link';
import DownIcon from './DownIcon';
import Loading from './Loading';
import BlockLoader from '../Page/BlockLoader';
import SchemaForm from './SchemaForm';
import { useTranslation } from 'next-i18next';
import { useUser } from '../../../console/components/UserProvider';
import { original } from '../Page/computeBlocks';
import Head from 'next/head';
import parser from 'html-react-parser';

const HeadFromString = ({ children }: { children: string }) => {
  return <Head>{parser(children)}</Head>;
};

export const BlocksProvider: FC = ({ children }) => {
  const { id } = useWorkspace();
  const { user } = useUser();
  const {
    i18n: { language },
  } = useTranslation();
  const { initAuthentication } = useUser();
  const uploadFile = useCallback(
    async (
      file: string,
      opts?: {
        expiresAfter?: number;
        public?: boolean;
        shareToken?: boolean;
      }
    ) => {
      if (!id) return file;
      // Delete these lines as soon as we migrated existing blocks using legacy syntax
      if (typeof opts === 'number') {
        opts = {
          expiresAfter: opts,
        };
      }
      const [{ url, mimetype, name }] = await api.uploadFiles(file, id, opts);

      return {
        value: url,
        preview: getPreview(mimetype, url),
        label: name,
      };
    },
    [id]
  );

  const auth = useMemo(() => {
    return {
      getSigninUrl: async ({ redirect = '' } = {}) => {
        if (!user || user.authData?.anonymous) {
          return initAuthentication({ redirect });
        }

        return redirect;
      },
      getSignupUrl: async ({ redirect = '' } = {}) => {
        return `/signup${redirect ? `?redirect=${redirect}` : ''}`;
      },
    };
  }, [initAuthentication, user]);

  const changeBlockConfig = useCallback((_block, newConfig) => {
    const { [original]: block = _block } = _block || {};
    return {
      ...block,
      ...newConfig,
    };
  }, []);

  return (
    <Provider
      externals={externals}
      components={{ Link, Loading, DownIcon, SchemaForm, Head: HeadFromString }}
      utils={{ uploadFile, BlockLoader, auth, changeBlockConfig }}
      language={language}
    >
      {children}
    </Provider>
  );
};

export default BlocksProvider;
