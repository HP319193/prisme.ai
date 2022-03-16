import { createContext, FC, ReactNode, useContext, useState } from 'react';

interface BlockContext {
  setButtons: (buttons: ReactNode[]) => void;
  buttons?: ReactNode[];
}

export const blockContext = createContext<BlockContext>({
  setButtons() {},
});
export const useBlock = () => useContext(blockContext);

export const BlockProvider: FC = ({ children }) => {
  const [buttons, setButtons] = useState<BlockContext['buttons']>();

  return (
    <blockContext.Provider value={{ setButtons, buttons }}>
      {children}
    </blockContext.Provider>
  );
};
