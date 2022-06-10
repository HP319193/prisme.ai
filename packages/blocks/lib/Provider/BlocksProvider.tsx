import blocksContext, { BlocksDependenciesContext } from './blocksContext';
import { FC } from 'react';
import * as defaultComponents from './defaultComponents';

export const BlocksProvider: FC<BlocksDependenciesContext> = ({
  children,
  externals,
  components,
}) => (
  <blocksContext.Provider
    value={{ externals, components: { ...defaultComponents, ...components } }}
  >
    {children}
  </blocksContext.Provider>
);
