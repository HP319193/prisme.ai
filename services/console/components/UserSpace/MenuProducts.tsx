import { Menu, Tooltip } from 'antd';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useProducts } from '../../providers/Products';
import useLocalizedText from '../../utils/useLocalizedText';

export const MenuProducts = () => {
  const { t } = useTranslation('user');
  const { localize } = useLocalizedText();
  const { highlighted } = useProducts();

  return (
    <Menu
      items={[
        ...Array.from(highlighted.entries()).map(
          ([, { href, name, icon, description }]) => ({
            key: href,
            label: (
              <Tooltip title={localize(description)} placement="left">
                <div>
                  <Link href={href}>
                    <a className="flex flex-row items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={icon}
                        alt={localize(name)}
                        className="flex mr-4"
                      />
                      <div className="text-[#344054] text-[14px] font-medium whitespace-nowrap">
                        {localize(name)}
                      </div>
                    </a>
                  </Link>
                </div>
              </Tooltip>
            ),
          })
        ),
        {
          type: 'divider',
        },
        {
          key: 'all',
          label: (
            <Link href="/products">
              <a>{t('header.products.seeall')}</a>
            </Link>
          ),
          className: 'whitespace-nowrap',
        },
      ]}
    />
  );
};

export default MenuProducts;
