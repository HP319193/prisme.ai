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
  title:
    | string
    | ReactNode
    | FC<{ setVisible: Dispatch<SetStateAction<boolean>> }>;
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
      title={typeof title === 'function' ? title({ setVisible }) : title}
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
