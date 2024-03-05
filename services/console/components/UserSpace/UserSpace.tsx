import { ReactNode } from 'react';
import WorkspaceBuilder from '../WorkspaceBuilder/WorkspaceBuilder';
import logo from '../../public/images/header-logo.svg';
import helpIcon from '../../public/images/header-help.svg';
import menuIcon from '../../public/images/header-menu.svg';
import bellIcon from '../../public/images/header-bell.svg';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
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
import { Popover } from '@prisme.ai/design-system';
import { useUser } from '../UserProvider';

const {
  publicRuntimeConfig: { HEADER_POPOVERS },
} = getConfig();

function getHeaderPopovers() {
  try {
    return JSON.parse(HEADER_POPOVERS);
  } catch {
    return {};
  }
}

const headerPopovers = getHeaderPopovers();

interface UserSpaceProps {
  children: ReactNode;
}

export const UserSpace = ({ children }: UserSpaceProps) => {
  const { t } = useTranslation('user');
  const { trackEvent } = useTracking();
  const { user } = useUser();

  if (!user) return null;

  return (
    <ProductsProvider>
      <div className="dark flex flex-col flex-1 min-h-full">
        <div className="flex flex-row bg-layout-surface h-[70px] pl-[24px] justify-between">
          <Link href="/">
            <a className="flex">
              <Image src={logo} alt="Prisme.ai" />
            </a>
          </Link>
          <div className="flex relative">
            {headerPopovers.whatsNew && (
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
                  <Image src={bellIcon} alt={t('header.notifications.title')} />
                </button>
              </Popover>
            )}
            {headerPopovers.help && (
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
