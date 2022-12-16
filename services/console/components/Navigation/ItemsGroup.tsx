import { PlusCircleOutlined } from '@ant-design/icons';
import { StretchContent } from '@prisme.ai/design-system';
import { Tooltip } from 'antd';
import { FC } from 'react';
import ChevronIcon from '../../icons/chevron.svgr';

export interface ItemsGroupProps {
  title: string;
  onClick?: () => void;
  onAdd?: () => void;
  tooltip?: string;
  open: boolean;
}
export const ItemsGroup: FC<ItemsGroupProps> = ({
  title,
  open,
  onClick,
  onAdd,
  tooltip = '',
  children,
}) => {
  return (
    <div className="flex flex-1 leading-[2.5rem]">
      <div className="flex flex-1 flex-col max-w-full">
        <div className="flex flex-1 flex-row items-center border-b-[1px]">
          <button
            className="flex flex-1 flex-row items-center outline-none focus:outline-none p-4"
            onClick={onClick}
          >
            <Tooltip title={title} placement="left">
              <div className="flex m-2 mr-4 w-[1.6rem] h-[1.6rem] justify-center">
                <ChevronIcon
                  width="1rem"
                  className={` transition-transform ${
                    open ? '' : '-rotate-90'
                  }`}
                />
              </div>
            </Tooltip>
            <div className="flex flex-1 font-bold whitespace-nowrap">
              {title}
            </div>
          </button>
          {onAdd && (
            <Tooltip title={tooltip} placement="left">
              <button
                className="flex outline-none focus:outline-none p-4 hover:text-accent"
                onClick={onAdd}
              >
                <PlusCircleOutlined />
              </button>
            </Tooltip>
          )}
        </div>
        <div className="flex flex-1">
          <StretchContent visible={open} className="whitespace-nowrap flex-1">
            {children}
          </StretchContent>
        </div>
      </div>
    </div>
  );
};

export default ItemsGroup;
