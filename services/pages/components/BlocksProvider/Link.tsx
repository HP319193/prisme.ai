import {
  cloneElement,
  HTMLAttributes,
  ReactElement,
  useCallback,
  useState,
} from 'react';
import NextLink from 'next/link';
import { usePreview } from '../usePreview';

export const Link = ({
  href,
  children,
  ...props
}: { href: string; children: ReactElement } & HTMLAttributes<
  HTMLAnchorElement
>) => {
  const [isPreview, setIsPreview] = useState(false);
  const setPreview = useCallback(() => {
    setIsPreview(true);
  }, []);
  usePreview(setPreview);

  return (
    <NextLink href={href || ''}>
      <a
        {...props}
        onClick={(e) => {
          props.onClick && props.onClick(e);
          if (!isPreview) return;

          window.parent.postMessage(
            { type: 'pagePreviewNavigation', href },
            '*'
          );
        }}
      >
        {children}
      </a>
    </NextLink>
  );
};

export default Link;
