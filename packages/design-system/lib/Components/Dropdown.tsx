import {
  Dropdown as AntdDropdown,
  DropDownProps as AntdDropDownProps,
} from 'antd';
import { ReactElement } from 'react';

import { Space } from '../index';

export interface DropdownProps extends Omit<AntdDropDownProps, 'overlay'> {
  Menu: ReactElement;
  children: ReactElement | string;
}

const Dropdown = ({
  Menu,
  children,
  arrow = true,
  ...props
}: DropdownProps) => {
  if (!Menu) {
    return <div className="ant-dropdown-trigger">{children}</div>;
  }

  return (
    <AntdDropdown overlay={Menu} trigger={['click']} arrow={arrow} {...props}>
      <Space>{children}</Space>
    </AntdDropdown>
  );
};

export default Dropdown;
