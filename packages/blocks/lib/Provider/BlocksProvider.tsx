import blocksContext, { BlocksDependenciesContext } from './blocksContext';
import { FC } from 'react';
import * as defaultComponents from './defaultComponents';

interface BlocksProviderProps extends Omit<BlocksDependenciesContext, 'utils'> {
  utils?: BlocksDependenciesContext['utils'];
}

const dftUtils = {
  BlockLoader: () => null,
};

export const BlocksProvider: FC<BlocksProviderProps> = ({
  children,
  externals,
  utils = dftUtils,
  components,
}) => (
  <blocksContext.Provider
    value={{
      externals,
      components: { ...defaultComponents, ...components },
      utils,
    }}
  >
    {children}
  </blocksContext.Provider>
);
