import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useContext } from '../../utils/useContext';
import consoleIcon from '../../public/images/icon-console.svg';
import getConfig from 'next/config';

const {
  publicRuntimeConfig: { PRODUCTS_ENDPOINT = '' },
} = getConfig();

export interface Product {
  slug: string;
  href: string;
  name: string;
  icon: string;
  description: Prismeai.LocalizedText;
  highlighted?: boolean;
}

export interface ProductsContext {
  products: Map<string, Product>;
  highlighted: Map<string, Product>;
  fetchProducts: (query?: {
    slugs?: string[];
    highlighted?: true;
    page?: number;
    limit?: number;
  }) => Promise<{ list: Map<string, Product>; total: number; page: number }>;
  searchProducts: (query: { q?: string }) => Promise<Map<string, Product>>;
}

interface ProductsContextProviderProps {
  children: ReactNode;
}

export const productsContext = createContext<ProductsContext | undefined>(
  undefined
);

export const useProducts = () => useContext<ProductsContext>(productsContext);

export const builderProduct: Product = {
  slug: 'workspaces',
  href: '/workspaces',
  name: 'Low Code Builder',
  icon: consoleIcon.src,
  description: {
    fr: 'Créer et gérer vos produits',
    en: 'Create and manage your products',
  },
  highlighted: true,
};

export const ProductsProvider = ({
  children,
}: ProductsContextProviderProps) => {
  const [products, setProducts] = useState<ProductsContext['products']>(
    new Map([['workspaces', builderProduct]])
  );
  const highlighted = useMemo(
    () =>
      new Map(
        Array.from(products).filter(([, { highlighted }]) => highlighted)
      ),
    [products]
  );
  const fetchProducts: ProductsContext['fetchProducts'] = useCallback(
    async (query) => {
      if (!PRODUCTS_ENDPOINT)
        return { list: new Map(), total: 0, page: query?.page || 1 };
      async function fetchResults() {
        try {
          const results = await fetch(PRODUCTS_ENDPOINT, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
            },
            body: JSON.stringify(query),
          });
          if (!results.ok) {
            throw new Error(results.statusText);
          }
          const res: { list: Product[]; total: number; page: number } =
            await results.json();
          return res;
        } catch {
          return { list: [], total: 0, page: query?.page || 1 };
        }
      }
      const { list, ...rest } = await fetchResults();

      const fetched: Map<string, Product> = new Map(
        list.map(({ slug, name, icon, description, highlighted }) => [
          slug,
          {
            slug,
            href: `/product/${slug}`,
            name,
            icon,
            description,
            highlighted,
          },
        ])
      );

      setProducts((prev) => {
        const newList = new Map(prev);
        Array.from(fetched.entries()).forEach(([slug, product]) => {
          newList.set(slug, product);
        });
        return newList;
      });
      return {
        list: fetched,
        ...rest,
      };
    },
    []
  );

  const searchProducts: ProductsContext['searchProducts'] =
    useCallback(async () => {
      // TODO : fetch from API
      return new Map();
    }, []);

  useEffect(() => {
    fetchProducts({ highlighted: true });
  }, [fetchProducts]);

  return (
    <productsContext.Provider
      value={{ products, highlighted, fetchProducts, searchProducts }}
    >
      {children}
    </productsContext.Provider>
  );
};

export default ProductsProvider;
