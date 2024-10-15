import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Storage from '../../utils/Storage';
import Button from './Button';
import { builderProduct, Product, useProducts } from '../../providers/Products';
import burgerIcon from '../../public/images/sidebar-burger.svg';
import unpinIcon from '../../public/images/icon-unpin.svg';
import { useTranslation } from 'next-i18next';
import { useUser } from '../UserProvider';
import Image from 'next/image';
import ConfirmButton from '../ConfirmButton';
import { Tooltip } from 'antd';
import pkg from '../../../../package.json';
import useLocalizedText from '../../utils/useLocalizedText';

function getProductSlug(path: string) {
  if (path.match(/^\/workspaces/)) {
    return 'workspaces';
  }
  const [, slug] = path.match(/^\/product\/([^/$]+)/) || [];
  return slug;
}

export const ProductsSidebar = () => {
  const { t } = useTranslation('user');
  const { localize } = useLocalizedText();
  const [expanded, setExpanded] = useState(!!Storage.get('sidebarExpanded'));
  const { user, updateMeta } = useUser();
  const [added, setAdded] = useState<string>('');
  const { fetchProducts, shortcuts, changeProductUrl } = useProducts();

  const products: Product[] = useMemo(
    () => (user && user.meta?.products) || [],
    [user]
  );
  const router = useRouter();
  const toggleSidebar = useCallback(() => {
    setExpanded(!expanded);
    Storage.set('sidebarExpanded', !expanded);
  }, [expanded]);

  const selected = useMemo(() => {
    const productSlug = getProductSlug(router.asPath);
    return products.findIndex(({ slug }) => slug === productSlug);
  }, [products, router.asPath]);

  const updateUserMeta = useRef((product: Product) => {});
  updateUserMeta.current = (product: Product) => {
    if (user.meta?.products?.find(({ href = '' }) => product.href === href))
      return;
    setAdded(product.slug);
    updateMeta({
      products: [...(user?.meta?.products || []), product],
    });
  };
  useEffect(() => {
    if (!user) return;
    async function getProduct(path: string) {
      const slug = getProductSlug(path);
      if (!slug) return;
      if (slug === 'workspaces') {
        return builderProduct;
      } else {
        if (user?.meta?.products?.find(({ slug: s = '' }) => slug === s))
          return;
        const { list } = await fetchProducts({ slugs: [slug] });
        if (!list.size) return null;
        const result = list.get(slug);
        return result;
      }
    }
    async function updateUser() {
      const product = await getProduct(router.asPath);
      if (!product) return;
      updateUserMeta.current(product);
    }
    updateUser();
  }, [fetchProducts, router, user]);

  const removeProduct = useCallback(
    (slug: string) => () => {
      if (!user || !user?.meta?.products) return;
      const currentSlug = getProductSlug(router.asPath);
      if (slug === currentSlug) {
        router.push('/');
      }
      setTimeout(() => {
        // Tiemout to get the product removed after the next run of this effect
        // and avoid readding the product after removing it
        updateMeta({
          products: user.meta?.products?.filter(
            ({ slug: s = '' }) => s !== slug
          ),
        });
      }, 1000);
    },
    [router, updateMeta, user]
  );

  return (
    <div
      className={`flex flex-col bg-layout-surface py-[31px] overflow-hidden transition-all`}
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
          {shortcuts && shortcuts.length > 0 && (
            <div className="flex relative group flex-col">
              {shortcuts.map(
                ({ name, href, icon }, key) =>
                  href && (
                    <Link href={href} key={key}>
                      <a
                        className="flex flex-1"
                        onClick={() => changeProductUrl(href)}
                      >
                        <Button
                          expanded={expanded}
                          icon={icon}
                          name={localize(name)}
                        />
                      </a>
                    </Link>
                  )
              )}
            </div>
          )}
          {products.map(({ slug, href, icon, name }, index) => (
            <div
              key={href}
              className={`flex relative group ${
                added === slug ? 'animate-add-product animate-[' : ''
              }`}
            >
              <Link href={href}>
                <a
                  className="flex flex-1"
                  onClick={(e) => {
                    changeProductUrl(href);
                  }}
                >
                  <Button
                    expanded={expanded}
                    selected={index === selected}
                    icon={icon}
                    name={name}
                  />
                </a>
              </Link>
              <div className="absolute top-1/2 right-6 transition-opacity opacity-0 group-hover:opacity-100">
                <Tooltip title={t('sidebar.unpin.tooltip')} placement="right">
                  <ConfirmButton
                    onConfirm={removeProduct(slug)}
                    className="!m-0 !p-0 !-mt-1"
                    confirmLabel={t('sidebar.unpin.confirm')}
                    yesLabel={t('sidebar.unpin.yes')}
                    noLabel={t('sidebar.unpin.no')}
                    placement="right"
                  >
                    <Image src={unpinIcon} alt="" />
                  </ConfirmButton>
                </Tooltip>
              </div>
            </div>
          ))}
          <div className="text-white flex flex-1 justify-end items-end mr-6">
            v{pkg.version}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsSidebar;
