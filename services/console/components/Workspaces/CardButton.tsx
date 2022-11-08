import Link from 'next/link';
import { FC } from 'react';

export interface CardButtonProps {
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
}

const Abutton: FC<CardButtonProps> = ({
  children,
  href,
  className,
  onClick,
}) => {
  if (href)
    return (
      <Link href={href}>
        <a className={className}>
          <button className="flex items-center max-w-full focus:outline-none">
            {children}
          </button>
        </a>
      </Link>
    );
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
};
export const CardButton: FC<CardButtonProps> = ({
  onClick,
  href,
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className="relative group flex flex-col h-32 w-[100%] md:w-[calc(100%/2)] lg:w-[calc(100%/3)] xl:w-[calc(100%/4)]"
      {...props}
    >
      <Abutton
        className={`flex m-2 h-full justify-between overflow-hidden rounded border ${className}`}
        onClick={onClick}
        href={href}
      >
        {children}
      </Abutton>
    </div>
  );
};

export default CardButton;
