import blocksContext, { BlocksDependenciesContext } from './blocksContext';
import { FC } from 'react';

export const BlocksProvider: FC<BlocksDependenciesContext> = ({
  children,
  externals,
}) => (
  <blocksContext.Provider value={{ externals }}>
    {children}
  </blocksContext.Provider>
);
