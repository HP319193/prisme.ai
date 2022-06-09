import blocksContext, { BlocksDependenciesContext } from './blocksContext';
import { FC } from 'react';

export const BlocksProvider: FC<BlocksDependenciesContext> = ({
  children,
  externals,
  linkGenerator,
}) => (
  <blocksContext.Provider value={{ externals, linkGenerator }}>
    {children}
  </blocksContext.Provider>
);
