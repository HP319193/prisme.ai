import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import Storage from '../../utils/Storage';
import Button from './Button';
import HistoryKeeper from './HistoryKeeper';
import { useProducts } from './useProducts';
import burgerIcon from '../../public/images/sidebar-burger.svg';
import gearIcon from '../../public/images/sidebar-gear.svg';
import { useTranslation } from 'next-i18next';

export const ProductsSidbar = () => {
  const { t } = useTranslation('user');
  const [expanded, setExpanded] = useState(!!Storage.get('sidebarExpanded'));
  const products = useProducts();
  const router = useRouter();
  const toggleSidebar = useCallback(() => {
    setExpanded(!expanded);
    Storage.set('sidebarExpanded', !expanded);
  }, [expanded]);

  const selected = useMemo(() => {
    return products.findIndex(({ href }) => router.asPath.match(href));
  }, [products, router.asPath]);
  return (
    <div
      className={`flex flex-col bg-[#E6EFFF] py-[31px] overflow-hidden transition-all`}
      style={{
        width: expanded ? '300px' : '70px',
      }}
    >
      <div className="flex flex-1 flex-col w-[300px]">
        <div className="flex flex-col flex-1">
          <Button
            expanded={expanded}
            icon={burgerIcon.src}
            tooltip={t('sidebar.expand', { context: expanded ? 'in' : '' })}
            onClick={toggleSidebar}
          />
          <HistoryKeeper>
            {products.map(({ href, icon, name }, index) => (
              <Link href={href} key={href}>
                <a className="flex">
                  <Button
                    expanded={expanded}
                    selected={index === selected}
                    icon={icon}
                    name={name}
                  />
                </a>
              </Link>
            ))}
          </HistoryKeeper>
        </div>
        <Button
          expanded={expanded}
          selected={false}
          icon={gearIcon.src}
          tooltip={t('sidebar.settings.title')}
          onClick={() => {
            console.log('manage sidebar settings');
          }}
        />
      </div>
    </div>
  );
};

export default ProductsSidbar;
