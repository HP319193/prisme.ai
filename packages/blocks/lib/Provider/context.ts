import { Api, Events } from '@prisme.ai/sdk';
import { createContext, useContext } from 'react';

export interface BlockContext<T = any, AppConfig = any> {
  setAppConfig?: (config: AppConfig) => void;
  appConfig?: AppConfig;
  setConfig?: (config: T) => void;
  config: T;
  events?: Events;
  api?: Api;
  onLoad?: (block: any) => void;
}

export const blockContext = createContext<BlockContext>({
  config: {},
  setAppConfig() {},
  setConfig() {},
});
export const useBlock = <T = any, AppConfig = any>() =>
  useContext<BlockContext<T, AppConfig>>(blockContext);

export default blockContext;
