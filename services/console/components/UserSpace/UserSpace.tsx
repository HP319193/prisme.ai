import { ReactNode, useCallback, useEffect, useState } from 'react';
import WorkspaceBuilder from '../WorkspaceBuilder/WorkspaceBuilder';
import logo from '../../public/images/header-logo.svg';
import helpIcon from '../../public/images/header-help.svg';
import menuIcon from '../../public/images/header-menu.svg';
import bellIcon from '../../public/images/header-bell.svg';
import Image from 'next/image';
import { useTranslation, i18n } from 'next-i18next';
import Avatar from './Avatar';
import { ProductsSidebar } from './ProductsSidebar';
import { Dropdown } from 'antd';
import MenuUser from './MenuUser';
import MenuProducts from './MenuProducts';
import Link from 'next/link';
import { ProductsProvider } from '../../providers/Products';
import getConfig from 'next/config';
import IFrameLoader from '../IFrameLoader';
import { useTracking } from '../Tracking';
import { Loading, Popover } from '@prisme.ai/design-system';
import { useUser } from '../UserProvider';
import { useRouter } from 'next/router';
import api from '../../utils/api';
import FourOhFour from '../../pages/404';

const {
  publicRuntimeConfig: { HEADER_POPOVERS, USER_SPACE_ENDPOINT = '' },
} = getConfig();

function getHeaderPopovers() {
  try {
    return JSON.parse(HEADER_POPOVERS);
  } catch {
    return {};
  }
}

const headerPopovers = getHeaderPopovers();

interface UserSpaceConfig {
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
   * Define if Whats new popover is visible.
   * @default true
   */
  displayWhatsNew?: boolean;
  /**
   * Define if Help popover is visible.
   * @default true
   */
  displayHelp?: boolean;
  /**
   * Define if products popover is visible.
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

interface UserSpaceProps {
  children: ReactNode;
}

export const UserSpace = ({ children }: UserSpaceProps) => {
  const { t } = useTranslation('user');
  const { trackEvent } = useTracking();
  const { user } = useUser();
  const { asPath, replace } = useRouter();
  const [userSpaceConfig, setUserSpaceConfig] = useState<UserSpaceConfig>();

  useEffect(() => {
    /**
     * Some elements can be hide or changed by calling a user contextualised
     * endpoint. This endpoint must return an object following the
     * UserSpaceConfig interface.
     */
    if (!USER_SPACE_ENDPOINT) {
      setUserSpaceConfig({});
      return;
    }
    const fetchUserSpaceConfig = async () => {
      try {
        const res = await fetch(USER_SPACE_ENDPOINT, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${api.token}`,
          },
        });
        setUserSpaceConfig(await res.json());
      } catch {
        setUserSpaceConfig({});
      }
    };
    fetchUserSpaceConfig();
  }, [user]);

  useEffect(() => {
    if (!userSpaceConfig?.kiosk || !userSpaceConfig?.mainUrl) return;
    if (!asPath.includes(userSpaceConfig.kiosk)) {
      replace(userSpaceConfig.mainUrl);
    }
  }, [asPath, replace, userSpaceConfig?.kiosk, userSpaceConfig?.mainUrl]);

  if (!user || user?.authData?.anonymous) return <>{children}</>;
  if (userSpaceConfig === undefined) return <Loading />;

  if (userSpaceConfig.disableBuilder && asPath.startsWith('/workspaces'))
    return <FourOhFour />;

  return (
    <ProductsProvider disableBuilder={userSpaceConfig.disableBuilder}>
      <div
        className="dark flex flex-col flex-1 min-h-full"
        style={userSpaceConfig?.style?.root || ({} as React.CSSProperties)}
      >
        <div className="flex flex-row bg-layout-surface h-[70px] pl-[24px] justify-between">
          <Link href={userSpaceConfig?.mainUrl || '/'}>
            <a className="flex">
              {userSpaceConfig.mainLogo?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={userSpaceConfig.mainLogo.url}
                  {...(userSpaceConfig.mainLogo.attrs || {})}
                  alt="Prisme.ai"
                />
              ) : (
                <Image src={logo} alt="Prisme.ai" />
              )}
            </a>
          </Link>
          <div className="flex relative">
            {userSpaceConfig.displayWhatsNew !== false &&
              headerPopovers.whatsNew && (
                <Popover
                  trigger={['click']}
                  placement="bottomRight"
                  content={() => (
                    <div className="flex h-[75vh] w-[30rem]">
                      <IFrameLoader
                        className="flex flex-1"
                        src={headerPopovers.whatsNew}
                      />
                    </div>
                  )}
                  overlayClassName="pr-full-popover"
                  onOpenChange={(open) => {
                    trackEvent({
                      name: `Open header popover whatsNew`,
                      action: 'click',
                    });
                  }}
                >
                  <button className="m-[1rem]">
                    <Image
                      src={bellIcon}
                      alt={t('header.notifications.title')}
                    />
                  </button>
                </Popover>
              )}
            {userSpaceConfig.displayHelp !== false && headerPopovers.help && (
              <Popover
                trigger={['click']}
                placement="bottomRight"
                content={() => (
                  <div className="flex h-[75vh] w-[30rem]">
                    <IFrameLoader
                      className="flex flex-1"
                      src={headerPopovers.help}
                    />
                  </div>
                )}
                overlayClassName="pr-full-popover"
                onOpenChange={(open) => {
                  trackEvent({
                    name: `Open header popover help`,
                    action: 'click',
                  });
                }}
              >
                <button className="m-[1rem]">
                  <Image src={helpIcon} alt={t('header.notifications.help')} />
                </button>
              </Popover>
            )}
            {userSpaceConfig.displayProducts !== false && (
              <Dropdown
                autoFocus
                overlay={<MenuProducts />}
                trigger={['click']}
                placement="bottom"
              >
                <button className="m-[1rem]">
                  <Image src={menuIcon} alt={t('header.products.title')} />
                </button>
              </Dropdown>
            )}
            <Dropdown
              autoFocus
              overlay={<MenuUser />}
              trigger={['click']}
              placement="bottom"
            >
              <button className="m-[1rem]">
                <Avatar />
              </button>
            </Dropdown>
          </div>
        </div>
        <div className="flex flex-row flex-1 max-h-[calc(100vh-70px)] max-w-[100vw]">
          <ProductsSidebar />
          <div className="flex flex-col flex-1 relative overflow-hidden">
            {<WorkspaceBuilder>{children}</WorkspaceBuilder>}
          </div>
        </div>
      </div>
    </ProductsProvider>
  );
};

export default UserSpace;
