import {
  Popover as AntdPopover,
  PopoverProps as AntdPopoverProps,
  Button,
} from 'antd';
import { Dispatch, FC, ReactElement, SetStateAction, useState } from 'react';

export interface PopoverProps extends AntdPopoverProps {
  children: ReactElement;
  content: FC<{ setVisible: Dispatch<SetStateAction<boolean>> }>;
  title: string;
}

const Popover = ({ title, children, content, ...otherProps }: PopoverProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <AntdPopover
      content={() => content({ setVisible })}
      title={title}
      trigger="click"
      visible={visible}
      onVisibleChange={setVisible}
      {...otherProps}
    >
      {children}
    </AntdPopover>
  );
};

export default Popover;
