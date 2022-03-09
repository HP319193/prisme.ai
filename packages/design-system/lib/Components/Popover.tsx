import { Popover as AntdPopover, PopoverProps as AntdPopoverProps } from 'antd';
import {
  Dispatch,
  FC,
  ReactElement,
  ReactNode,
  SetStateAction,
  useState,
} from 'react';

export interface PopoverProps extends AntdPopoverProps {
  children: ReactElement;
  content: FC<{ setVisible: Dispatch<SetStateAction<boolean>> }>;
  title: string | ReactNode;
  initialVisible?: boolean;
}

const Popover: FC<PopoverProps> = ({
  title,
  children,
  content,
  initialVisible = false,
  ...otherProps
}) => {
  const [visible, setVisible] = useState(initialVisible);

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
