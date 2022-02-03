import { ReactElement } from "react";
import { Button as AntdButton } from "antd";

type antdButtonsType = "link" | "text" | "default";

const prismeBtnTypeToAntdType: [string, antdButtonsType][] = [
  ["default", "default"],
  ["grey", "text"],
  ["link", "link"],
];

export interface ButtonProps {
  children: ReactElement | string;
  type?: string;
  key?: string | number;
}

const Button = ({ children, type = "default", key }: ButtonProps) => {
  const btnType = prismeBtnTypeToAntdType.find(
    ([inputType, resultType]) => inputType === type
  );

  if (!btnType) {
    console.error("wrong button type for button", children);
    return null;
  }

  return (
    <AntdButton type={btnType[1]} key={key}>
      {children}
    </AntdButton>
  );
};

export default Button;
