import { SchemaForm } from '@prisme.ai/design-system';
import { SchemaFormContext } from '@prisme.ai/design-system/lib/Components/SchemaForm/context';
import { createContext, FC, useContext } from 'react';
import { TBlockLoader } from './types';

export interface BlocksDependenciesContext {
  externals: any;
  components: {
    Link: FC<{ href: string } & any>;
    Loading: FC;
    DownIcon: FC<{ className?: string }>;
    SchemaForm: typeof SchemaForm;
  };
  utils: Partial<SchemaFormContext['utils']> & {
    BlockLoader: TBlockLoader;
    getWorkspaceHost: () => string;
    auth?: {
      getSigninUrl: () => Promise<string>;
      getSignupUrl: () => Promise<string>;
    };
  };
}

export const blocksContext = createContext<BlocksDependenciesContext>({
  externals: {},
  components: {
    Link: () => null,
    Loading: () => null,
    DownIcon: () => null,
    SchemaForm: SchemaForm,
  },
  utils: {
    BlockLoader: () => null,
    uploadFile: async (base64: string) => '',
    getWorkspaceHost() {
      return `${window.location.protocol}//${window.location.host}`;
    },
    auth: {
      getSigninUrl: async () => '',
      getSignupUrl: async () => '',
    },
  },
});
export const useBlocks = () => useContext(blocksContext);

export default blocksContext;
