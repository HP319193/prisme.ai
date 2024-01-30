import { useRouter } from 'next/router';
import { memo, useEffect, useMemo, useRef } from 'react';
import api from '../../utils/api';

export const Product = memo(function Product() {
  const iframe = useRef<HTMLIFrameElement>(null);
  const {
    query: { slug = [] },
    push,
  } = useRouter();

  const [productSlug] = Array.isArray(slug) ? slug : [slug];
  const productUrl = useMemo(() => {
    const [, path] = window.location.pathname.split(`product/${productSlug}`);
    return `http://${productSlug}.pages.local.prisme.ai:3100/${path}${window.location.search}${window.location.hash}`;
  }, [productSlug]);

  useEffect(() => {
    if (!iframe.current) return;
    iframe.current.contentWindow?.postMessage({
      type: 'api.token',
      token: api.token,
    });
    const listener = ({ data: { type = '', path = '' } = {} }) => {
      if (type !== 'page.navigate' || !path) return;
      const [prefix] = window.location.pathname.split(`product/${productSlug}`);
      const rootPath = `${prefix}product/${productSlug}`;
      //window.history.pushState({}, '', `${rootPath}${path}`);
      push(`${rootPath}${path}`);
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, [productSlug, push]);

  if (!productUrl) return null;
  return <iframe ref={iframe} src={productUrl} className="h-full" />;
});

export default Product;
