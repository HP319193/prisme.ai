import { createContext, ReactNode, useContext } from 'react';

export interface BlockContext {
  setAppConfig: (config: any) => void;
  appConfig?: any;
  setConfig: (config: any) => void;
  config?: any;
  setSetupComponent: (setupComponent: ReactNode) => void;
  setupComponent?: ReactNode;
  setButtons: (buttons: ReactNode[]) => void;
  buttons?: ReactNode[];
}

export const blockContext = createContext<BlockContext>({
  setAppConfig() {},
  setConfig() {},
  setSetupComponent() {},
  setButtons() {},
});
export const useBlock = () => useContext(blockContext);

export default blockContext;
