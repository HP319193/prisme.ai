import { FC } from 'react';

interface CardsContainerProps {
  className?: string;
}
export const CardsContainer: FC<CardsContainerProps> = ({
  className,
  children,
}) => {
  return (
    <div
      className={`${className} flex flex-wrap align-items-start justify-content-start`}
    >
      {children}
    </div>
  );
};
export default CardsContainer;
