import { FC } from 'react';
import { Spin } from 'antd';

interface LoadingProps {
  className?: string;
}
export const Loading: FC<LoadingProps> = ({ className }) => {
  return (
    <div className="flex flex-1 align-center justify-center">
      <Spin
        className={`!flex justify-center items-center ${className || ''}`}
      />
    </div>
  );
};

export default Loading;
