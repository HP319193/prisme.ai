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

export const BlocksProvider: FC = ({ children }) => {
  const { id } = useWorkspace();
  const {
    i18n: { language },
  } = useTranslation();
  const { initAuthentication } = useUser();
  const uploadFile = useCallback(
    async (file: string) => {
      if (!id) return file;
      const [{ url, mimetype, name }] = await api.uploadFiles(file, id);

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
        return initAuthentication({ redirect });
      },
      getSignupUrl: async ({ redirect = '' } = {}) => {
        return `/signup${redirect ? `?redirect=${redirect}` : ''}`;
      },
    };
  }, [initAuthentication]);
  const changeBlockConfig = useCallback((_block, newConfig) => {
    const { [original]: block = _block } = _block;
    return {
      ...block,
      ...newConfig,
    };
  }, []);
  return (
    <Provider
      externals={externals}
      components={{ Link, Loading, DownIcon, SchemaForm }}
      utils={{ uploadFile, BlockLoader, auth, changeBlockConfig }}
      language={language}
    >
      {children}
    </Provider>
  );
};

export default BlocksProvider;
