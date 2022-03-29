import { Popover as AntdPopover, PopoverProps as AntdPopoverProps } from 'antd';
import {
  Dispatch,
  FC,
  ReactElement,
  ReactNode,
  SetStateAction,
  useState,
  useEffect,
  useCallback,
} from 'react';

type SetVisible = (visible: boolean) => void;
export interface PopoverProps extends AntdPopoverProps {
  children?: ReactElement;
  content: FC<{ setVisible: SetVisible }>;
  title: string | ReactNode | FC<{ setVisible: SetVisible }>;
  initialVisible?: boolean;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

const Popover: FC<PopoverProps> = ({
  title,
  children,
  content,
  initialVisible = false,
  visible: controlledVisible,
  onVisibleChange,
  ...otherProps
}) => {
  const [visible, setVisible] = useState(initialVisible);

  useEffect(() => {
    if (controlledVisible === undefined) return;
    setVisible(controlledVisible);
  }, [controlledVisible]);

  const toggleVisible = useCallback(
    (visible: boolean) => {
      if (onVisibleChange) onVisibleChange(visible);
      else setVisible(visible);
    },
    [onVisibleChange]
  );

  return (
    <AntdPopover
      content={() => content({ setVisible: toggleVisible })}
      title={typeof title === 'function' ? title({ setVisible }) : title}
      trigger="click"
      visible={visible}
      onVisibleChange={(visible) => toggleVisible(visible)}
      {...otherProps}
    >
      {children}
    </AntdPopover>
  );
};

export default Popover;
