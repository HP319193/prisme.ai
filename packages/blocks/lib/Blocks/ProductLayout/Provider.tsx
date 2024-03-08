import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

export interface ProductLayoutContext {
  sidebarOpen: boolean;
  toggleSidebar: (state?: 'open' | 'close') => void;
  canToggleSidebar: boolean;
}
export const productLayoutContext = createContext<
  ProductLayoutContext | undefined
>(undefined);
export function useProductLayoutContext() {
  const context = useContext(productLayoutContext);
  if (context === undefined) {
    throw new Error(
      'useProductLayoutContext must be used within a ProductLayoutProvider'
    );
  }
  return context;
}

interface ProductLayoutProviderProps {
  children: ReactNode;
  opened?: boolean;
}
export const ProductLayoutProvider = (props: ProductLayoutProviderProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(props.opened || false);
  const toggleSidebar: ProductLayoutContext['toggleSidebar'] = useCallback(
    (state) => {
      if (state === 'open') return setSidebarOpen(true);
      if (state === 'close') return setSidebarOpen(false);
      setSidebarOpen((prev) => !prev);
    },
    []
  );
  const canToggleSidebar = props.opened === undefined;
  return (
    <productLayoutContext.Provider
      value={{ sidebarOpen, toggleSidebar, canToggleSidebar }}
    >
      {props.children}
    </productLayoutContext.Provider>
  );
};

export default ProductLayoutProvider;
