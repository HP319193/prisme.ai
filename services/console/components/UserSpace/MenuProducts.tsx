import { Menu } from 'antd';
import { useTranslation } from 'next-i18next';
import consoleIcon from '../../public/images/icon-console.svg';
import { useState } from 'react';
import Link from 'next/link';
import { useProducts } from './useProducts';

export const MenuProducts = () => {
  const { t } = useTranslation('user');
  const products = useProducts();
  const [highlightedProducts, setHighlightedProducts] = useState([
    {
      href: '/workspaces',
      name: t('header.products.builder.title'),
      icon: consoleIcon.src,
    },
  ]);
  return (
    <Menu
      items={[
        ...highlightedProducts.map(({ href, name, icon }) => ({
          key: href,
          label: (
            <Link href={href}>
              <a className="flex flex-row items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icon} alt={name} className="flex mr-4" />
                <div className="text-[#344054] text-[14px] font-medium">
                  name
                </div>
              </a>
            </Link>
          ),
        })),
        {
          type: 'divider',
        },
        {
          key: '6',
          label: t('header.products.seeall'),
          onClick: () => console.log('yo'),
          className: 'whitespace-nowrap',
        },
      ]}
    />
  );
};

export default MenuProducts;
