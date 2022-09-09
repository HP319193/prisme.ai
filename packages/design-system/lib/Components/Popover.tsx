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
  title?: string | ReactNode | FC<{ setVisible: SetVisible }>;
  initialVisible?: boolean;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  titleClassName?: string;
}

const Popover: FC<PopoverProps> = ({
  title,
  children,
  content,
  initialVisible = false,
  visible: controlledVisible,
  onVisibleChange,
  titleClassName,
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
        title ? (
          <div
            className={`flex w-full items-center justify-between flex-row p-[2.5rem] !pb-[1.4rem] font-semibold overflow-hidden rounded-t-[0.6rem] ${
              titleClassName || ''
            }`}
          >
            {typeof title === 'function' ? title({ setVisible }) : title}
          </div>
        ) : (
          <div
            className={`flex w-full items-center justify-between flex-row font-semibold overflow-hidden rounded-t-[0.6rem]`}
          />
        )
      }
      trigger="click"
      open={visible}
      onOpenChange={(visible) => toggleVisible(visible)}
      {...otherProps}
    >
      {children}
    </AntdPopover>
  );
};

export default Popover;
