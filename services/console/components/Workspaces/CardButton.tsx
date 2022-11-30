import Link from 'next/link';
import { FC, forwardRef, ReactNode } from 'react';

export interface CardButtonProps {
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
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
export const CardButton = forwardRef<HTMLDivElement, CardButtonProps>(
  function CardButton(
    {
      onClick,
      href,
      children,
      className = '',
      containerClassName = '',
      ...props
    },
    ref
  ) {
    return (
      <div
        className={`
        relative group flex flex-col h-32
        w-[100%] md:w-[calc(100%/2)] lg:w-[calc(100%/3)] xl:w-[calc(100%/4)]
        ${containerClassName}`}
        ref={ref}
        {...props}
      >
        <Abutton
          className={`flex m-2 h-full justify-between overflow-hidden rounded border
          transition-all
          hover:-translate-y-1 hover:shadow-lg
          ${className}`}
          onClick={onClick}
          href={href}
        >
          {children}
        </Abutton>
      </div>
    );
  }
);

export default CardButton;
