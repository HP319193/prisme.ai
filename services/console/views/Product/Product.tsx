import { useTranslation } from 'next-i18next';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { memo, useEffect, useMemo, useRef } from 'react';
import api from '../../utils/api';

const {
  publicRuntimeConfig: { PAGES_HOST = '' },
} = getConfig();

export const Product = memo(function Product() {
  const {
    i18n: { language },
  } = useTranslation();
  const iframe = useRef<HTMLIFrameElement>(null);
  const {
    asPath,
    query: { slug = [] },
    replace,
    push,
  } = useRouter();

  const [productSlug] = Array.isArray(slug) ? slug : [slug];
  const productUrl = useMemo(() => {
    const [, path] = window.location.pathname.split(`product/${productSlug}`);
    return `${window.location.protocol}//${productSlug}${PAGES_HOST}/${language}/${path}${window.location.search}${window.location.hash}`;
  }, [language, productSlug]);

  const lastiFrameUrl = useRef('');

  useEffect(() => {
    if (!iframe.current) return;

    const listener = ({
      origin,
      data,
      data: { type = '', path = '' } = {},
    }: MessageEvent) => {
      if (type !== 'page.navigate' || !path) return;

      const { host: hostOrigin } = new URL(origin);
      const { host: hostProduct } = new URL(productUrl);
      if (hostOrigin != hostProduct) {
        const [productSlug] = new URL(origin).hostname.split(PAGES_HOST);
        if (!productSlug) {
          throw new Error('invalid origin');
        }
        // Changing product!
        push(`/product/${productSlug}/${data.path}`);
        return;
      }

      const [prefix] = window.location.pathname.split(`product/${productSlug}`);
      const rootPath = `${prefix}product/${productSlug}`;
      replace(`${rootPath}${path}`);
      lastiFrameUrl.current = `${rootPath}${path}`;
    };
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  }, [productSlug, productUrl, push, replace]);

  useEffect(() => {
    if (!lastiFrameUrl.current.match(asPath)) {
      iframe.current?.setAttribute('src', productUrl);
    }
  }, [asPath, productUrl]);

  if (!productUrl) return null;
  return (
    <iframe
      ref={iframe}
      src={productUrl}
      className="h-full"
      allow="clipboard-write; camera; geolocation; microphone; speaker"
      title={productSlug}
    />
  );
});

export default Product;
