import { useTranslation } from 'next-i18next';
import Title from '../../components/Products/Title';
import Text from '../../components/Products/Text';
import { useUser } from '../../components/UserProvider';
import Input from '../../components/Products/Input';
import { useProducts } from '../../providers/Products';
import { useEffect, useMemo, useRef, useState } from 'react';
import ProductCard from '../../components/Products/ProductCard';
import useLocalizedText from '../../utils/useLocalizedText';
import Link from 'next/link';

export const Products = () => {
  const { t } = useTranslation('products');
  const { localize } = useLocalizedText();
  const { user } = useUser();
  const { products, fetchProducts } = useProducts();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const cardsEl = useRef<HTMLDivElement>(null);
  const [inputWidth, setInputWidth] = useState(0);

  const hasOther = useMemo(() => products.size < total, [products.size, total]);
  useEffect(() => {
    async function fetch() {
      const { total } = await fetchProducts({
        page,
        limit: page === 1 ? 11 : 12,
      });
      setTotal(total);
    }
    fetch();
  }, [fetchProducts, page, products.size]);

  useEffect(() => {
    if (!cardsEl.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cols = Math.floor(entry.contentRect.width / 290);
        switch (cols) {
          case 0:
          case 1:
            setInputWidth(264);
            break;
          case 2:
            setInputWidth(553);
            break;
          case 3:
            setInputWidth(846);
            break;
          default:
            setInputWidth(1132);
        }
      }
    });
    resizeObserver.observe(cardsEl.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="bg-products-bg flex flex-1 flex-col py-[25px] px-[53px] overflow-auto">
      <Title>{t('news.title')}</Title>
      <Text>Afficher des news ici</Text>
      <div className="flex flex-1 flex-col max-w-[1147px]">
        <Title className="text-products-xl">
          {t('welcome.title', { user: user.firstName })}
        </Title>
        <Text>{t('welcome.subtitle')}</Text>
        <div className="flex flex-col mr-[15px]">
          <Input
            search
            placeholder={t('search.placeholder')}
            className="mt-11 mb-12"
            style={{
              width: inputWidth ? `${inputWidth}px` : undefined,
            }}
          />
        </div>
        <Title className="mt-11">{t('list.title')}</Title>
        <div ref={cardsEl} className="flex flex-row flex-wrap -ml-[13px]">
          {Array.from(products).map(
            ([slug, { description, name, icon, href }]) => (
              <Link href={href} key={slug}>
                <a>
                  <ProductCard
                    title={localize(name)}
                    description={localize(description)}
                    icon={icon}
                  />
                </a>
              </Link>
            )
          )}
        </div>
      </div>
      {hasOther && (
        <button
          className="text-products-text"
          onClick={() => setPage(page + 1)}
        >
          next
        </button>
      )}
    </div>
  );
};

export default Products;
