import { FC, useState } from 'react';
import blockContext, { BlockContext } from './context';

interface BlockProviderProps {
  config: any;
  onConfigUpdate: (config: any) => void;
  appConfig: any;
  onAppConfigUpdate: (config: any) => void;
}

export const BlockProvider: FC<BlockProviderProps> = ({
  children,
  config,
  onConfigUpdate,
  appConfig,
  onAppConfigUpdate,
}) => {
  const [setupComponent, setSetupComponent] = useState<
    BlockContext['setupComponent']
  >();
  const [buttons, setButtons] = useState<BlockContext['buttons']>();

  return (
    <blockContext.Provider
      value={{
        appConfig,
        setAppConfig: onAppConfigUpdate,
        config,
        setConfig: onConfigUpdate,
        setupComponent,
        setSetupComponent,
        setButtons,
        buttons,
      }}
    >
      {children}
    </blockContext.Provider>
  );
};
