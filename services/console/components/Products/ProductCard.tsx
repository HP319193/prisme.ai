import Text from './Text';

interface ProductCardProps {
  icon: string;
  title: string;
  description: string;
}
export const ProductCard = ({ icon, title, description }: ProductCardProps) => {
  return (
    <div className="flex w-[264px] h-[130px] bg-white rounded m-[13px] items-center">
      <div className="flex w-[80px] justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt={title} width="43px" height="43px" />
      </div>
      <div className="flex flex-1 flex-col">
        <Text className="!font-bold !text-product-text-on-white">{title}</Text>
        <Text className="!text-product-text-on-white opacity-60">
          {description}
        </Text>
      </div>
    </div>
  );
};
export default ProductCard;
