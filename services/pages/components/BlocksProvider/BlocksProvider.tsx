import { BlocksProvider as Provider } from '@prisme.ai/blocks';
import { FC, useCallback } from 'react';
import externals from '../../../console/utils/externals';
import { useWorkspace } from '../Workspace';
import api from '../../../console/utils/api';
import { getPreview } from './getPreview';
import Link from './Link';
import DownIcon from './DownIcon';
import Loading from './Loading';
import BlockLoader from '../Page/BlockLoader';

export const BlocksProvider: FC = ({ children }) => {
  const { id } = useWorkspace();
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
  return (
    <Provider
      externals={externals}
      components={{ Link, Loading, DownIcon }}
      utils={{ uploadFile, BlockLoader }}
    >
      {children}
    </Provider>
  );
};

export default BlocksProvider;
