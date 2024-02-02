import { HTMLAttributes } from 'react';

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  as?: Extract<keyof JSX.IntrinsicElements, 'p'>;
  className?: string;
}

export const Text = ({ as: As = 'p', className = '', ...props }: TextProps) => {
  return (
    <As
      className={`text-products-text text-products-base font-normal mb-2 mt-1 ${className}`}
      {...props}
    />
  );
};

export default Text;
