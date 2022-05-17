import { FC } from 'react';
import blockContext from './context';
import { Events } from '@prisme.ai/sdk';

interface BlockProviderProps {
  config: any;
  onConfigUpdate?: (config: any) => void;
  appConfig: any;
  onAppConfigUpdate?: (config: any) => void;
  events?: Events;
}

export const BlockProvider: FC<BlockProviderProps> = ({
  children,
  config,
  onConfigUpdate,
  appConfig,
  onAppConfigUpdate,
  events,
}) => {
  return (
    <blockContext.Provider
      value={{
        appConfig,
        setAppConfig: onAppConfigUpdate,
        config,
        setConfig: onConfigUpdate,
        events,
      }}
    >
      {children}
    </blockContext.Provider>
  );
};
