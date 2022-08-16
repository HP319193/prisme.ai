import { useMemo } from 'react';
import { Button as AntdButton, ButtonProps as AntdButtonProps } from 'antd';

export interface ButtonProps extends Omit<AntdButtonProps, 'type'> {
  variant?: 'default' | 'primary' | 'grey' | 'link';
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
  children,
  variant = 'default',
  type = 'button',
  // className,
  ...props
}: ButtonProps) => {
  const antdType = useMemo(() => {
    if (variant === 'grey') return 'text';
    return variant;
  }, [variant]);

  return (
    <AntdButton
      type={antdType}
      htmlType={type}
      {...props}
      // className={`${className} ${props.disabled ? 'cursor-not-allowed' : ''}`}
    >
      {children}
    </AntdButton>
  );
};

export default Button;
