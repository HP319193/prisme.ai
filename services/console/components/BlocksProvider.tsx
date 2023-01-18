import { FC, HTMLAttributes } from 'react';
import { Loading as DSLoading, SchemaForm } from '@prisme.ai/design-system';
import NextLink from 'next/link';
import externals from '../utils/externals';
import Image from 'next/image';
import { BlocksProvider as PRBlocksProvider } from '@prisme.ai/blocks';
import down from '../icons/down.svg';
import { usePageEndpoint } from '../utils/urls';

const Loading = () => (
  <DSLoading className="bg-white absolute top-0 right-0 bottom-0 left-0" />
);
const Link = ({
  href = '',
  ...props
}: { href: string } & HTMLAttributes<HTMLAnchorElement>) => {
  return <NextLink {...props} href={href || ''} />;
};
const DownIcon = ({ className }: { className?: string }) => (
  <Image src={down.src} width={14} height={14} alt="" className={className} />
);

export const BlocksProvider: FC = ({ children }) => {
  const pageHost = usePageEndpoint();
  return (
    <PRBlocksProvider
      externals={externals}
      components={{ Link, Loading, DownIcon, SchemaForm }}
      utils={{
        getWorkspaceHost() {
          return pageHost;
        },
      }}
    >
      {children}
    </PRBlocksProvider>
  );
};

export const PublicBlocksProvider: FC = ({ children }) => {
  return (
    <PRBlocksProvider
      externals={externals}
      components={{ Link, Loading, DownIcon, SchemaForm }}
    >
      {children}
    </PRBlocksProvider>
  );
};
