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

const keyProductLayoutSidebarIsOpen = 'productLayoutSidebarIsOpen';
function getOpenedState() {
  try {
    return sessionStorage.getItem(keyProductLayoutSidebarIsOpen) === 'true';
  } catch (e) {
    console.error('getOpenedState', e);
    return false;
  }
}
function saveOpenedState(state: boolean) {
  try {
    sessionStorage.setItem(keyProductLayoutSidebarIsOpen, `${state}`);
  } catch (e) {
    console.error('saveOpenedState', e);
  }
}

interface ProductLayoutProviderProps {
  children: ReactNode;
  opened?: boolean;
}
export const ProductLayoutProvider = (props: ProductLayoutProviderProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(
    props.opened !== undefined ? props.opened : getOpenedState() || false
  );
  const toggleSidebar: ProductLayoutContext['toggleSidebar'] = useCallback(
    (state) => {
      setSidebarOpen((prev) => {
        const newState = state === undefined ? !prev : state === 'open';
        saveOpenedState(newState);
        return newState;
      });
    },
    []
  );
  return (
    <productLayoutContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      {props.children}
    </productLayoutContext.Provider>
  );
};

export default ProductLayoutProvider;
