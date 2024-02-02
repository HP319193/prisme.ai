import { HTMLAttributes } from 'react';

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: Extract<
    keyof JSX.IntrinsicElements,
    'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  >;
}

export const Title = ({
  as: As = 'h2',
  className = '',
  ...props
}: TitleProps) => {
  return (
    <As
      className={`text-products-text text-products-lg font-bold mb-2 mt-1 ${className}`}
      {...props}
    />
  );
};

export default Title;
