import { SchemaFormContext } from '@prisme.ai/design-system/lib/Components/SchemaForm/context';
import { createContext, FC, useContext } from 'react';
import { TBlockLoader } from './types';

export interface BlocksDependenciesContext {
  externals: any;
  components: {
    Link: FC<{ href: string } & any>;
    Loading: FC;
    DownIcon: FC<{ className?: string }>;
  };
  utils: Partial<SchemaFormContext['utils']> & {
    BlockLoader: TBlockLoader;
  };
}

export const blocksContext = createContext<BlocksDependenciesContext>({
  externals: {},
  components: {
    Link: () => null,
    Loading: () => null,
    DownIcon: () => null,
  },
  utils: {
    BlockLoader: () => null,
    uploadFile: async () => '',
  },
});
export const useBlocks = () => useContext(blocksContext);

export default blocksContext;
