import { builtinBlocks } from '@prisme.ai/blocks';
import { createContext, ReactNode, useCallback, useState } from 'react';
import Storage from '../../../utils/Storage';
import { useContext } from '../../../utils/useContext';

const {
  ProductLayout: { useProductLayoutContext },
} = builtinBlocks;

export interface OpenStateContext {
  opened: Set<string>;
  toggle: (path: string) => () => void;
}
export const openStateContext = createContext<OpenStateContext | undefined>(
  undefined
);
export const useOpenState = () => useContext(openStateContext);
interface OpenStateProviderProps {
  children: ReactNode;
  id?: string;
}
export const OpenStateProvider = ({
  id = '',
  children,
}: OpenStateProviderProps) => {
  const key = `sidebar-opened-${id}`;
  const { toggleSidebar, sidebarOpen } = useProductLayoutContext();
  const [opened, setOpened] = useState<Set<string>>(
    new Set(Storage.get(key) || [])
  );
  const toggle = useCallback(
    (href: string) => () => {
      if (!sidebarOpen && !opened.has(href)) {
        toggleSidebar();
      }
      setOpened((prev) => {
        const newValue = new Set(prev);
        if (newValue.has(href)) {
          newValue.delete(href);
        } else {
          newValue.add(href);
        }
        Storage.set(key, Array.from(newValue));
        return newValue;
      });
    },
    [key, opened, sidebarOpen, toggleSidebar]
  );

  return (
    <openStateContext.Provider value={{ opened, toggle }}>
      {children}
    </openStateContext.Provider>
  );
};

export default OpenStateProvider;
