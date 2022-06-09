import { createContext, ReactElement, useContext } from 'react';

export interface BlocksDependenciesContext {
  externals: any;
  linkGenerator?: (url: string, props: any) => ReactElement;
}

export const blocksContext = createContext<BlocksDependenciesContext>({
  externals: {},
  linkGenerator: undefined,
});
export const useBlocks = () => useContext(blocksContext);

export default blocksContext;
