import { FC } from 'react';

interface CardsContainerProps {
  className?: string;
}
export const CardsContainer: FC<CardsContainerProps> = ({
  className,
  children,
}) => {
  return (
    <div className={`${className} flex flex-wrap align--start justify-start`}>
      {children}
    </div>
  );
};
export default CardsContainer;
