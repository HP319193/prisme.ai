import { Spin } from 'antd';

export interface LoadingProps {
  className?: string;
}
export const Loading = ({ className }: LoadingProps) => (
  <div className="flex flex-1 align-center justify-center">
    <Spin className={`!flex justify-center items-center ${className || ''}`} />
  </div>
);

export default Loading;
