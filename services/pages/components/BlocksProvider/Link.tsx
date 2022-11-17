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
    <NextLink href={href || ''} {...props}>
      {cloneElement(children, {
        onClick(e: any) {
          if (children.props.onClick) children.props.onClick(e);
          if (!isPreview) return;
          window.parent.postMessage(
            { type: 'pagePreviewNavigation', href },
            '*'
          );
        },
      })}
    </NextLink>
  );
};

export default Link;
