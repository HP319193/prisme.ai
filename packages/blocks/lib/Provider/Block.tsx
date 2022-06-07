import { FC } from 'react';
import blockContext from './context';
import { Events } from '@prisme.ai/sdk';

export interface BlockProviderProps {
  config?: any;
  onConfigUpdate?: (config: any) => void;
  appConfig?: Prismeai.DetailedAppInstance['config'];
  onAppConfigUpdate?: (config: any) => void;
  events?: Events;
  api?: any;
}

export const BlockProvider: FC<BlockProviderProps> = ({
  children,
  config = {},
  onConfigUpdate,
  appConfig = {},
  onAppConfigUpdate,
  events,
  api,
}) => {
  return (
    <blockContext.Provider
      value={{
        appConfig,
        setAppConfig: onAppConfigUpdate,
        config,
        setConfig: onConfigUpdate,
        events,
        api,
      }}
    >
      {children}
    </blockContext.Provider>
  );
};
