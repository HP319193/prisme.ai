import { HTMLAttributes } from 'react';

interface TextProps extends HTMLAttributes<HTMLParagraphElement> {
  as?: Extract<keyof JSX.IntrinsicElements, 'p'>;
  className?: string;
}

export const textClassName = 'text-main-text font-normal mb-2 mt-1';

export const Text = ({ as: As = 'p', className = '', ...props }: TextProps) => {
  return <As className={`${textClassName} ${className}`} {...props} />;
};

export default Text;
