import { DownOutlined } from "@ant-design/icons";
import { Dropdown as AntdDropdown } from "antd";
import { ReactElement } from "react";

import { Space } from "../index";

export interface DropdownProps {
  Menu: ReactElement;
  children: ReactElement | string;
}

const Dropdown = ({ Menu, children }: DropdownProps) => {
  if (!Menu) {
    return <div className="ant-dropdown-trigger">{children}</div>;
  }

  return (
    <AntdDropdown overlay={Menu} trigger={["click"]}>
      <Space>
        {children}
        <DownOutlined />
      </Space>
    </AntdDropdown>
  );
};

export default Dropdown;
