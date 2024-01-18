import { SchemaForm } from '@prisme.ai/design-system';
import { SchemaFormContext } from '@prisme.ai/design-system/lib/Components/SchemaForm/context';
import { createContext, FC, ReactElement, useContext } from 'react';
import { Block, TBlockLoader } from './types';

export interface BlocksDependenciesContext {
  externals: any;
  components: {
    Link: FC<{ href: string } & any>;
    Loading: FC;
    DownIcon: FC<{ className?: string }>;
    SchemaForm: typeof SchemaForm;
    Head?: (props: { children: string }) => ReactElement;
  };
  utils: Partial<SchemaFormContext['utils']> & {
    BlockLoader: TBlockLoader;
    getWorkspaceHost: () => string;
    auth?: {
      getSigninUrl: (options?: { redirect?: string }) => Promise<string>;
      getSignupUrl: (options?: { redirect?: string }) => Promise<string>;
    };
    changeBlockConfig: (block: any, newConfig: Record<string, any>) => Block;
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
    uploadFile: async (base64: string, opts) => '',
    getWorkspaceHost() {
      return `${window.location.protocol}//${window.location.host}`;
    },
    auth: {
      getSigninUrl: async () => '',
      getSignupUrl: async () => '',
    },
    changeBlockConfig: (block) => block,
  },
});
export const useBlocks = () => useContext(blocksContext);

export default blocksContext;
