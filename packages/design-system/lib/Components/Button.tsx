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

  const tagBgColor = useMemo(() => {
    if (variant === 'primary') {
      return unselected ? `bg-gray-500` : `bg-light-accent`;
    }
    return `bg-gray-500`;
  }, [variant, unselected]);

  const unselectedStyle = useMemo(() => {
    return unselected
      ? variant === 'primary'
        ? `!bg-white border border-solid text-accent`
        : `text-gray`
      : '';
  }, [variant, unselected]);

  return (
    <AntdButton
      type={antdType}
      htmlType={type}
      {...props}
      className={`flex flex-row ${unselectedStyle}`}
    >
      {children}
      {tag && (
        <div
          className={`ml-[0.3rem] ${tagBgColor} rounded-[0.3rem] px-[0.3rem]`}
        >
          {tag}
        </div>
      )}
    </AntdButton>
  );
};

export default Button;
