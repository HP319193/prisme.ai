import { Popover as AntdPopover, PopoverProps as AntdPopoverProps } from 'antd';
import {
  FC,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
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
      content={
        <div className="flex flex-1 h-full overflow-auto">
          {content({ setVisible: toggleVisible })}
        </div>
      }
      title={
        <div className="flex w-full items-center justify-between flex-row p-5 bg-accent text-white font-semibold overflow-hidden rounded-t-[0.6rem]">
          {typeof title === 'function' ? title({ setVisible }) : title}
        </div>
      }
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
