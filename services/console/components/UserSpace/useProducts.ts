import { useUser } from '../UserProvider';
import consoleIcon from '../../public/images/icon-console.svg';
import { useCallback } from 'react';

export interface Product {
  href: string;
  name: string;
  icon: string;
}

export const BuilderProduct: Product = {
  href: '/workspaces',
  name: 'Product Builder',
  icon: consoleIcon.src,
};

const PRODUCTS_CACHE = new Map();

export const useProducts = (): {
  highlighted: Product[];
  list: Product[];
  total: number;
  page: number;
} => {
  const fetchProducts = useCallback(() => {
    // TODO : fetch products
  }, []);

  //return user.meta?.products || [];
  return {
    highlighted: [
      {
        href: '/workspaces',
        name: 'Product Builder',
        icon: consoleIcon.src,
      },
      {
        href: '/product/ai-knowledge-chat',
        name: 'AI Chat',
        icon: 'https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/dskaYe2/30tMRR-KI-IgZCXDbY0XU.icon-aik.svg',
      },
    ],
    list: [],
    total: 0,
    page: 1,
  };
};
