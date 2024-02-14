import { Tooltip } from 'antd';
import { ReactNode, useRef } from 'react';
import { textClassName } from './Text';

interface ProductCardProps {
  icon: string | ReactNode;
  title: string;
  description: string;
  className?: string;
}
export const ProductCard = ({
  icon,
  title,
  description,
  className = '',
}: ProductCardProps) => {
  const titleRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  function isOverflowing(el: HTMLElement | null) {
    if (!el) return false;
    return el.offsetWidth < el.scrollWidth;
  }

  return (
    <div
      className={`flex h-[130px] bg-main-element rounded m-[13px] items-center ${className}`}
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
          title={isOverflowing(titleRef.current) ? title : undefined}
          placement="bottom"
        >
          <div
            ref={titleRef}
            className={`${textClassName} !font-bold !text-main-text overflow-ellipsis overflow-hidden whitespace-nowrap mr-[15px]`}
          >
            {title}
          </div>
        </Tooltip>
        <Tooltip
          title={isOverflowing(textRef.current) ? description : undefined}
          placement="bottom"
        >
          <div
            ref={textRef}
            className={`${textClassName} !text-main-text opacity-60 overflow-ellipsis overflow-hidden whitespace-nowrap mr-[15px]`}
          >
            {description}
          </div>
        </Tooltip>
      </div>
    </div>
  );
};
export default ProductCard;
