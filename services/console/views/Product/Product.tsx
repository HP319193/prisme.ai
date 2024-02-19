import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { memo, useEffect, useMemo, useRef } from 'react';
import api from '../../utils/api';

const {
  publicRuntimeConfig: { PAGES_HOST = '' },
} = getConfig();

export const Product = memo(function Product() {
  const iframe = useRef<HTMLIFrameElement>(null);
  const {
    query: { slug = [] },
    replace,
  } = useRouter();

  const [productSlug] = Array.isArray(slug) ? slug : [slug];
  const productUrl = useMemo(() => {
    const [, path] = window.location.pathname.split(`product/${productSlug}`);
    return `${window.location.protocol}//${productSlug}${PAGES_HOST}/${path}${window.location.search}${window.location.hash}`;
  }, [productSlug]);

  useEffect(() => {
    if (!iframe.current) return;
    iframe.current.contentWindow?.postMessage({
      type: 'api.token',
      token: api.token,
    });

    const listener = ({
      origin,
      data: { type = '', path = '' } = {},
    }: MessageEvent) => {
      const { host: hostOrigin } = new URL(origin);
      const { host: hostProduct } = new URL(productUrl);
      if (hostOrigin != hostProduct) {
        throw new Error('invalid origin');
      }

      if (type !== 'page.navigate' || !path) return;
      const [prefix] = window.location.pathname.split(`product/${productSlug}`);
      const rootPath = `${prefix}product/${productSlug}`;
      replace(`${rootPath}${path}`);
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, [productSlug, productUrl, replace]);

  if (!productUrl) return null;
  return <iframe ref={iframe} src={productUrl} className="h-full" allow="*" />;
});

export default Product;
