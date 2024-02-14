import { Tooltip } from 'antd';
import { ReactNode } from 'react';
import Text from './Text';

interface ProductCardProps {
  icon: string | ReactNode;
  title: string;
  description: string;
  width?: string;
  bgColor?: string;
  color?: string;
  className?: string;
}
export const ProductCard = ({
  icon,
  title,
  description,
  width,
  bgColor = 'white',
  color,
  className = '',
}: ProductCardProps) => {
  return (
    <div
      className={`flex h-[130px] bg-[${bgColor}] rounded m-[13px] items-center ${className}`}
    >
      {typeof icon === 'string' ? (
        <div className="flex w-[80px] justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon} alt={title} width="43px" height="43px" />
        </div>
      ) : (
        icon
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Tooltip
          title={title.length > 50 ? title : undefined}
          placement="bottom"
        >
          <Text
            className={`!font-bold ${
              color ? `!text-[${color}]` : '!text-product-text-on-white'
            } overflow-ellipsis overflow-hidden whitespace-nowrap mr-[15px]`}
          >
            {title}
          </Text>
        </Tooltip>
        <Tooltip
          title={description.length > 50 ? description : undefined}
          placement="bottom"
        >
          <Text
            className={`${
              color ? `!text-[${color}]` : '!text-product-text-on-white'
            } opacity-60 overflow-ellipsis overflow-hidden whitespace-nowrap mr-[15px]`}
          >
            {description}
          </Text>
        </Tooltip>
      </div>
    </div>
  );
};
export default ProductCard;
