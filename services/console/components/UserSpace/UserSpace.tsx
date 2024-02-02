import { ReactNode } from 'react';
import WorkspaceBuilder from '../WorkspaceBuilder/WorkspaceBuilder';
import logo from '../../public/images/header-logo.svg';
import helpIcon from '../../public/images/header-help.svg';
import menuIcon from '../../public/images/header-menu.svg';
import bellIcon from '../../public/images/header-bell.svg';

import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import Avatar from './Avatar';
import { ProductsSidbar } from './ProductsSidebar';
import { Dropdown } from 'antd';
import MenuUser from './MenuUser';
import MenuProducts from './MenuProducts';
import Link from 'next/link';
import { ProductsProvider } from '../../providers/Products';

interface UserSpaceProps {
  children: ReactNode;
}

export const UserSpace = ({ children }: UserSpaceProps) => {
  const { t } = useTranslation('user');

  return (
    <ProductsProvider>
      <div className="flex flex-col flex-1 min-h-full">
        <div className="flex flex-row bg-[#0A1D3B] h-[70px] pl-[24px] justify-between">
          <Link href="/">
            <a className="flex">
              <Image src={logo} alt="Prisme.ai" />
            </a>
          </Link>
          <div className="flex relative">
            <button className="m-[1rem]">
              <Image src={bellIcon} alt={t('header.notifications.title')} />
            </button>
            <button className="m-[1rem]">
              <Image src={helpIcon} alt={t('header.notifications.help')} />
            </button>
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
          <ProductsSidbar />
          <div className="flex flex-col flex-1 relative overflow-hidden">
            {<WorkspaceBuilder>{children}</WorkspaceBuilder>}
          </div>
        </div>
      </div>
    </ProductsProvider>
  );
};

export default UserSpace;
