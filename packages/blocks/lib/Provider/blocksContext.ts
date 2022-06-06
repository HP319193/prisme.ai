import { createContext, useContext } from 'react';

export interface BlocksDependenciesContext {
  externals: any;
}

export const blocksContext = createContext<BlocksDependenciesContext>({
  externals: {},
});
export const useBlocks = () => useContext(blocksContext);

export default blocksContext;
