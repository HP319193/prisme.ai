import { useTranslation } from 'next-i18next';
import Title from '../../components/Products/Title';
import Text from '../../components/Products/Text';
import { useUser } from '../../components/UserProvider';
import Input from '../../components/Products/Input';
import { Product, useProducts } from '../../providers/Products';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProductCard from '../../components/Products/ProductCard';
import useLocalizedText from '../../utils/useLocalizedText';
import Link from 'next/link';
import useScrollListener from '../../components/useScrollListener';
import { Loading } from '@prisme.ai/design-system';
import CloseIcon from '/icons/close.svgr';

export const Products = () => {
  const { t } = useTranslation('products');
  const { localize } = useLocalizedText();
  const { user } = useUser();
  const { products, fetchProducts, canSearch, searchProducts, shortcuts } =
    useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<Product[] | null>(null);
  const [page, setPage] = useState(1);
  const { ref, bottom } = useScrollListener<HTMLDivElement>({ margin: -1 });

  const hasMore = useRef(false);
  useEffect(() => {
    async function fetch() {
      const limit = page === 1 ? 19 : 21;
      const { list } = await fetchProducts({
        page,
        limit,
      });
      hasMore.current = list.size === limit;
    }
    fetch();
  }, [fetchProducts, page]);

  useEffect(() => {
    if (bottom && hasMore.current) {
      hasMore.current = false;
      setPage(page + 1);
    }
  }, [bottom, hasMore, page]);

  const search = useCallback(
    async (query: string) => {
      if (searching) return;
      setFound(null);
      setSearching(true);
      setFound(await searchProducts({ query }));
      setSearching(false);
    },
    [searchProducts, searching]
  );

  const filteredProducts = useMemo(
    () =>
      found && Array.isArray(found)
        ? found.map((item) => ({
            ...item,
            href: `/product/${item.slug}`,
          }))
        : Array.from(products.values()),
    [found, products]
  );

  return (
    <div
      className="bg-main-surface flex flex-1 flex-col py-[25px] px-[53px] overflow-auto"
      ref={ref}
    >
      {/*<Title>{t('news.title')}</Title>
      <Text>Afficher des news ici</Text>*/}
      <div className="flex flex-1 flex-col ">
        <Title className="text-products-xl">
          {t('welcome.title', { user: user?.firstName })}
        </Title>
        <Text>{t('welcome.subtitle')}</Text>
        {canSearch && (
          <form
            className="flex flex-col mr-[15px] relative mt-11 mb-12"
            onSubmit={(e) => {
              if (searching) return;
              e.preventDefault();
              const target = e.target as typeof e.target & {
                query: { value: string };
              };
              search(target.query.value);
            }}
          >
            {searching && (
              <Loading className="absolute top-[15px] left-[15px]" />
            )}
            <Input
              value={searchQuery}
              onChange={({ target: { value } }) => setSearchQuery(value)}
              search={!searching}
              name="query"
              placeholder={t('search.placeholder')}
              disabled={searching}
            />
            {found && (
              <button
                type="button"
                className="absolute top-[19px] right-[15px]"
                onClick={() => {
                  setSearchQuery('');
                  setFound(null);
                }}
              >
                <CloseIcon className="text-main-element-text" />
              </button>
            )}
          </form>
        )}
        <Title className="mt-11">{t('list.title')}</Title>
        <div className="flex flex-row flex-wrap -ml-[13px]">
          {shortcuts.map(
            ({ name, description, href, icon }) =>
              href && (
                <Link href={href} key={href}>
                  <a className="w-[100%] 2xl:w-1/5 xl:w-1/4 lg:w-1/3 md:w-1/2">
                    <ProductCard
                      title={localize(name)}
                      description={localize(description)}
                      icon={icon}
                    />
                  </a>
                </Link>
              )
          )}
          {filteredProducts.map(({ slug, description, name, icon, href }) => (
            <Link href={href} key={slug}>
              <a className="w-[100%] 2xl:w-1/5 xl:w-1/4 lg:w-1/3 md:w-1/2">
                <ProductCard
                  title={localize(name)}
                  description={localize(description)}
                  icon={icon}
                />
              </a>
            </Link>
          ))}
        </div>
      </div>
      {hasMore.current && (
        <button className="text-main-text" onClick={() => setPage(page + 1)}>
          {t('list.more')}
        </button>
      )}
    </div>
  );
};

export default Products;
