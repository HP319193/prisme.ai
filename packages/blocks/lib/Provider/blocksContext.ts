import { createContext, FC, useContext } from 'react';

export interface BlocksDependenciesContext {
  externals: any;
  components: { Link: FC<{ href: string } & any>; Loading: FC };
}

export const blocksContext = createContext<BlocksDependenciesContext>({
  externals: {},
  components: {
    Link: () => null,
    Loading: () => null,
  },
});
export const useBlocks = () => useContext(blocksContext);

export default blocksContext;
