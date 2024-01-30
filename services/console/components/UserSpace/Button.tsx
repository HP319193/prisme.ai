import { Tooltip } from 'antd';
import { HTMLAttributes } from 'react';

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  expanded: boolean;
  selected?: boolean;
  icon: string;
  name?: string;
  tooltip?: string;
}
export const Button = ({
  expanded,
  selected,
  icon,
  name,
  tooltip = name,
  ...props
}: ButtonProps) => {
  if (name) {
    return (
      <button
        className={`flex flex-1 flex-row mt-[16px] items-center
                    ${
                      expanded
                        ? selected
                          ? 'rounded-[6px] bg-[#F8FAFF] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.20)] mx-[10px]'
                          : 'rounded-[6px] hover:bg-[#F8FAFF] hover:shadow-[0px_0px_10px_0px_rgba(0,0,0,0.20)] mx-[10px]'
                        : ''
                    }`}
        {...props}
      >
        <span className={`flex ${expanded ? '' : 'px-[10px]'}`}>
          <span
            className={`p-[14px] rounded-[6px] ${
              !expanded &&
              (selected
                ? 'bg-[#F8FAFF] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.20)]'
                : 'hover:bg-[#F8FAFF] hover:shadow-[0px_0px_10px_0px_rgba(0,0,0,0.20)]')
            }`}
          >
            <Tooltip title={expanded ? undefined : tooltip} placement="right">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon} alt={name} className="h-[26px] w-[26px]" />
            </Tooltip>
          </span>
        </span>
        {name && (
          <span className="flex items-center text-[#015DFF] text-[1.1rem] font-medium text-left">
            {name}
          </span>
        )}
      </button>
    );
  }
  return (
    <button className="flex justify-start px-[24px]" {...props}>
      <Tooltip title={tooltip} placement="right">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt={tooltip} />
      </Tooltip>
    </button>
  );
};

export default Button;
