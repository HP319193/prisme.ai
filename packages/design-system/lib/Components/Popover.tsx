import { Popover as AntdPopover, PopoverProps as AntdPopoverProps } from 'antd';
import {
  FC,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

type SetOpen = (open: boolean) => void;
export interface PopoverProps extends AntdPopoverProps {
  children?: ReactElement;
  content: FC<{ setOpen: SetOpen }>;
  title?: string | ReactNode | FC<{ setOpen: SetOpen }>;
  titleClassName?: string;
}

const Popover: FC<PopoverProps> = ({
  title,
  children,
  content,
  open,
  onOpenChange,
  titleClassName = 'flex w-full items-center justify-between flex-row p-[2.5rem] !pb-[1.4rem] font-semibold overflow-hidden rounded-t-[0.6rem]',
  ...otherProps
}) => {
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open === undefined) return;
    setVisible(open);
  }, [open]);

  const toggleVisible = useCallback(
    (open: boolean) => {
      onOpenChange && onOpenChange(open);
      setVisible(open);
    },
    [onOpenChange]
  );

  return (
    <AntdPopover
      content={
        <div className="flex flex-1 h-full overflow-auto">
          {content({ setOpen: toggleVisible })}
        </div>
      }
      title={
        title ? (
          <div className={titleClassName}>
            {typeof title === 'function'
              ? title({ setOpen: toggleVisible })
              : title}
          </div>
        ) : (
          <div
            className={`flex w-full items-center justify-between flex-row font-semibold overflow-hidden rounded-t-[0.6rem]`}
          />
        )
      }
      trigger="click"
      open={visible}
      onOpenChange={(open) => {
        toggleVisible(open);
      }}
      {...otherProps}
    >
      {children}
    </AntdPopover>
  );
};

export default Popover;
