import Link from "next/link";
import { FC, ReactNode } from "react";

export interface HeaderProps {
  title?: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
}

export const Header: FC<HeaderProps> = ({
  title,
  leftContent,
  rightContent,
}) => {
  return (
    <div className="flex justify-content-between">
      <div className="flex direction-row align-items-center">
        <div className="mr-2">
          <Link href="/workspaces">{title || "Prisme.ai"}</Link>
        </div>
        {leftContent}
      </div>
      {rightContent && <div>{rightContent}</div>}
    </div>
  );
};

export default Header;
