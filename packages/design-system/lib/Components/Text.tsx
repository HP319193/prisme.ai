import { HTMLAttributes, ReactElement } from 'react';

export interface TextProps extends HTMLAttributes<HTMLDivElement> {
  children: string | ReactElement;
  type?: 'grey' | 'regular';
}

const Text = ({ children, type = 'regular', ...props }: TextProps) => {
  return (
    <div className={type === 'grey' ? 'text-gray' : ''} {...props}>
      {children}
    </div>
  );
};

export default Text;
