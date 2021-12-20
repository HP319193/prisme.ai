import { FC } from "react";

interface LoadingProps {
  className?: string;
}
export const Loading: FC<LoadingProps> = ({ className }) => {
  return <div className={`${className} pi pi-spin pi-spinner`} />;
};

export default Loading;
