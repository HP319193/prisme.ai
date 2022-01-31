import { ReactElement } from "react";
import { Button } from "antd";

type antdButtonsType = "link" | "text" | "default";

const prismeBtnTypeToAntdType: [string, antdButtonsType][] = [
  ["default", "default"],
  ["grey", "text"],
  ["link", "link"],
];

interface ButtonProps {
  children: ReactElement;
  type?: string;
  key?: string | number;
}

export default ({ children, type = "default", key }: ButtonProps) => {
  const btnType = prismeBtnTypeToAntdType.find(
    ([inputType, resultType]) => inputType === type
  );

  if (!btnType) {
    console.error("wrong button type for button", children);
    return null;
  }

  return (
    <Button type={btnType[1]} key={key}>
      {children}
    </Button>
  );
};
