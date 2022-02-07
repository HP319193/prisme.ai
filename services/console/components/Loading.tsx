import { FC } from 'react';

interface LoadingProps {
  className?: string;
}
export const Loading: FC<LoadingProps> = ({ className }) => {
  return (
    <div className="flex flex-1 align-items-center justify-content-center">
      <div
        className={`${
          className || ''
        } align-self-center justify-self-center pi pi-spin pi-spinner`}
      />
    </div>
  );
};

export default Loading;
