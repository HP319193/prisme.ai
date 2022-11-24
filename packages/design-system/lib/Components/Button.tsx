import { useMemo } from 'react';
import { Button as AntdButton, ButtonProps as AntdButtonProps } from 'antd';

export interface ButtonProps extends Omit<AntdButtonProps, 'type'> {
  variant?: 'default' | 'primary' | 'grey' | 'link';
  type?: 'button' | 'submit' | 'reset';
  tag?: string;
  unselected?: boolean;
}

export const Button = ({
  children,
  variant = 'default',
  type = 'button',
  tag,
  unselected,
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
      className={`flex flex-row ${unselected ? 'text-[#939CA6]' : ''}`}
    >
      {children}
      {tag && (
        <div
          className={`ml-[0.3rem] ${
            unselected ? `bg-[#F2F4F9]` : `bg-[#F2F4F9]`
          } rounded-[0.3rem] px-[0.3rem]`}
        >
          {tag}
        </div>
      )}
    </AntdButton>
  );
};

export default Button;
