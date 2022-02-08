import { ReactElement } from 'react';

export interface TextProps {
  children: string | ReactElement;
  type: 'grey' | 'regular';
}

const Text = ({ children, type }: TextProps) => {
  return <div className={type === 'grey' ? 'text-gray' : ''}>{children}</div>;
};

export default Text;
