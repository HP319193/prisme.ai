import { Spin } from 'antd';

export interface LoadingProps {
  className?: string;
  spinClassName?: string;
}
export const Loading = ({ className, spinClassName }: LoadingProps) => (
  <div className={`flex flex-1 align-center justify-center ${className || ''}`}>
    <Spin
      className={`!flex justify-center items-center ${spinClassName || ''}`}
    />
  </div>
);

export default Loading;
