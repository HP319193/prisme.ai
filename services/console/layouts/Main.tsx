import { FC } from "react";
import Header, { HeaderProps } from "../components/Header";
import Toaster from "./Toaster";

interface MainProps extends HeaderProps {
  header?: () => JSX.Element;
}
export const Main: FC<MainProps> = ({
  header: H = Header,
  children,
  ...headerProps
}) => {
  return (
    <div className="flex min-h-screen flex-column">
      <div className="bg-primary p-4 z-1 shadow-4">
        <H {...headerProps} />
      </div>
      <div className="flex flex-1 surface-ground relative">
        <Toaster>{children}</Toaster>
      </div>
    </div>
  );
};

export default Main;
