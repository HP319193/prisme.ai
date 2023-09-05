import blocksContext, { BlocksDependenciesContext } from './blocksContext';
import { FC } from 'react';
import * as defaultComponents from './defaultComponents';
import i18n from '../i18n';

interface BlocksProviderProps extends Omit<BlocksDependenciesContext, 'utils'> {
  utils?: Partial<BlocksDependenciesContext['utils']>;
  language?: string;
}

const dftUtils = {
  BlockLoader: () => null,
  getWorkspaceHost() {
    return `${window.location.protocol}//${window.location.host}`;
  },
};

const uploadFile = async (file: string) => file;

export const BlocksProvider: FC<BlocksProviderProps> = ({
  children,
  externals,
  utils = dftUtils,
  components,
  language,
}) => {
  if (i18n.language !== language) {
    i18n.changeLanguage(language);
  }
  return (
    <blocksContext.Provider
      value={{
        externals,
        components: { ...defaultComponents, ...components },
        utils: {
          uploadFile,
          ...dftUtils,
          ...utils,
        },
      }}
    >
      {children}
    </blocksContext.Provider>
  );
};

export default BlocksProvider;
