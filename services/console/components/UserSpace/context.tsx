import { createContext } from 'react';
import { useContext } from '../../utils/useContext';

export interface UserSpaceConfig {
  /**
   * Main logo alternative
   */
  mainLogo?: {
    /**
     * Logo URL
     */
    url: string;
    /**
     * Attributes to apply on <img /> tag like alt or title
     */
    attrs?: object;
  };
  /**
   * Main URL on main logo link
   * @example: /product/ai-knowledge-chat/assistant?id=6474c0db33959b6283770367
   */
  mainUrl?: string;
  /**
   * The studio can act as a kiosk to keep the user in a URL template
   * @example: /product/ai-knowledge-chat/
   */
  kiosk?: string;
  /**
   * URL of "what's new" popover
   */
  whatsnewView?: string;
  /**
   * URL of "help" popover
   */
  helpView?: string;
  /**
   * Define if Whats new popover is visible.
   * @default true
   */
  displayProducts?: boolean;

  /**
   * style object that will be injected inside various sections, allowing to cutomize theme colors ...
   */
  style?: {
    root?: object;
  };

  /**
   * Disable Builder
   */
  disableBuilder?: true;
}

interface UserSpaceProviderContext extends UserSpaceConfig {}
export const userSpaceContext = createContext<
  UserSpaceProviderContext | undefined
>(undefined);
export const useUserSpace = () =>
  useContext<UserSpaceProviderContext>(userSpaceContext);
export default userSpaceContext;
