import { Events } from '@prisme.ai/sdk';
import { createContext, useContext } from 'react';

export interface BlockContext<T = any> {
  setAppConfig?: (config: any) => void;
  appConfig?: any;
  setConfig?: (config: any) => void;
  config?: T;
  events?: Events;
  api?: any;
  onLoad?: (block: any) => void;
}

export const blockContext = createContext<BlockContext>({
  setAppConfig() {},
  setConfig() {},
});
export const useBlock = <T = any>() =>
  useContext<BlockContext<T>>(blockContext);

export default blockContext;
