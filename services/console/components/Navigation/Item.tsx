import Link from 'next/link';
import { useRouter } from 'next/router';
import { FC, ReactChild, ReactElement } from 'react';

export interface ItemProps {
  href: string;
  icon: ReactChild | ((props: { selected: Boolean }) => ReactElement);
}
export const Item: FC<ItemProps> = ({ href, icon: Icon, children }) => {
  const { asPath } = useRouter();
  const selected = decodeURIComponent(asPath) === href;
  return (
    <Link href={href}>
      <a
        className={`flex flex-1 leading-10 px-4 py-2 group hover:bg-ultra-light-accent !text-base ${
          selected ? 'bg-ultra-light-accent font-bold' : ''
        }`}
      >
        <div
          className={`flex flex-1 flex-row items-center ${
            selected ? 'text-accent' : ''
          } max-w-[85%]`}
        >
          <div className="flex m-2 mr-4">
            {typeof Icon === 'function' ? <Icon selected={selected} /> : Icon}
          </div>
          <div className="flex flex-1 leading-7 max-w-full">{children}</div>
        </div>
      </a>
    </Link>
  );
};

export default Item;
