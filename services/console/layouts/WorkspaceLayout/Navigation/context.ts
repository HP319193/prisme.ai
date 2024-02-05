import { createContext } from 'react';
import { useContext } from '../../../utils/useContext';

interface NavigationContext {
  add: (type: string, path?: string) => () => void;
  highlight: string;
}
export const navigationContext = createContext<NavigationContext | undefined>(
  undefined
);
export const useNavigation = () => useContext(navigationContext);
