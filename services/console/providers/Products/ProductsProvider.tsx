import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useContext } from '../../utils/useContext';
import consoleIcon from '../../public/images/icon-console.svg';
import getConfig from 'next/config';
import { Loading } from '@prisme.ai/design-system';
import api from '../../utils/api';

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
export interface Shortcut {
  href: string;
  name: string;
  icon: string;
  description: Prismeai.LocalizedText;
}

export interface ProductsEndpointResponse {
  list: Product[];
  total: number;
  page: number;
  shortcuts: Shortcut[];
}

export interface ProductsContext {
  products: Map<string, Product>;
  shortcuts: Shortcut[];
  highlighted: Map<string, Product>;
  fetchProducts: (query?: {
    slugs?: string[];
    highlighted?: true;
    page?: number;
    limit?: number;
  }) => Promise<
    Omit<ProductsEndpointResponse, 'list'> & { list: Map<string, Product> }
  >;
  canSearch: boolean;
  searchProducts: (query: { query?: string }) => Promise<Product[]>;
}

interface ProductsContextProviderProps {
  children: ReactNode;
  disableBuilder?: true;
}

export const productsContext = createContext<ProductsContext | undefined>(
  undefined
);

export const useProducts = () => useContext<ProductsContext>(productsContext);

export const builderProduct: Product = {
  slug: 'workspaces',
  href: '/workspaces',
  name: 'Builder',
  icon: consoleIcon.src,
  description: {
    fr: 'Créer et gérer vos produits',
    en: 'Create and manage your products',
  },
  highlighted: true,
};

export const ProductsProvider = ({
  children,
  disableBuilder,
}: ProductsContextProviderProps) => {
  const [products, setProducts] = useState<ProductsContext['products']>(
    new Map(disableBuilder ? undefined : [['workspaces', builderProduct]])
  );
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const fetching = useRef(false);
  const [loading, setLoading] = useState(true);
  const highlighted = useMemo(
    () =>
      new Map(
        Array.from(products).filter(([, { highlighted }]) => highlighted)
      ),
    [products]
  );
  const fetchProducts: ProductsContext['fetchProducts'] = useCallback(
    async (query) => {
      if (!PRODUCTS_ENDPOINT || fetching.current)
        return {
          list: new Map(),
          total: 0,
          page: query?.page || 1,
          shortcuts: [],
        };
      fetching.current = true;
      async function fetchResults(): Promise<ProductsEndpointResponse> {
        try {
          const results = await fetch(PRODUCTS_ENDPOINT, {
            method: 'GET',
            headers: {
              'content-type': 'application/json',
              Authorization: `Bearer ${api.token}`,
            },
          });
          if (!results.ok) {
            throw new Error(results.statusText);
          }
          const res: {
            list: Product[];
            total: number;
            page: number;
            shortcuts: Shortcut[];
          } = await results.json();
          return res;
        } catch {
          const res = { list: [], total: 0, page: query?.page || 1, shortcuts };
          return res;
        }
      }
      const { list = [], shortcuts = [], ...rest } = await fetchResults();

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
      setShortcuts(shortcuts);
      fetching.current = false;
      return {
        list: fetched,
        shortcuts,
        ...rest,
      };
    },
    []
  );

  const searchProducts: ProductsContext['searchProducts'] = useCallback(
    async ({ query }) => {
      const res = await fetch(`${PRODUCTS_ENDPOINT}?q=${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) return null;
      return await res.json();
    },
    []
  );

  useEffect(() => {
    setLoading(true);
    fetchProducts({ highlighted: true });
    setLoading(false);
  }, [fetchProducts]);

  return (
    <productsContext.Provider
      value={{
        products,
        shortcuts,
        highlighted,
        fetchProducts,
        canSearch: !!PRODUCTS_ENDPOINT,
        searchProducts,
      }}
    >
      {loading ? <Loading /> : children}
    </productsContext.Provider>
  );
};

export default ProductsProvider;
