import { FC } from "react";
import Header, { HeaderProps } from "../components/Header";

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
      <div className="bg-primary p-4">
        <H {...headerProps} />
      </div>
      <div className="flex flex-1 surface-ground relative">{children}</div>
    </div>
  );
};

export default Main;
