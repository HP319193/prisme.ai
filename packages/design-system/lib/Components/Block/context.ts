import { createContext, ReactNode, useContext } from 'react';

export interface BlockContext<T = any> {
  setAppConfig?: (config: any) => void;
  appConfig?: any;
  setConfig?: (config: any) => void;
  config?: T;
  setSetupComponent?: (setupComponent: ReactNode) => void;
  setupComponent?: ReactNode;
  setButtons?: (buttons: ReactNode[]) => void;
  buttons?: ReactNode[];
}

export const blockContext = createContext<BlockContext>({
  setAppConfig() {},
  setConfig() {},
  setSetupComponent() {},
  setButtons() {},
});
export const useBlock = <T = any>() =>
  useContext<BlockContext<T>>(blockContext);

export default blockContext;
