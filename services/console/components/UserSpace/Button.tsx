import { Tooltip } from 'antd';
import { HTMLAttributes, ReactElement, ReactNode } from 'react';

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  expanded: boolean;
  selected?: boolean;
  icon: string | ReactNode;
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
                          ? 'rounded-[6px] bg-button shadow-[0px_0px_10px_0px_rgba(0,0,0,0.20)] mx-[7px]'
                          : 'rounded-[6px] hover:bg-button hover:shadow-[0px_0px_10px_0px_rgba(0,0,0,0.20)] mx-[7px]'
                        : ''
                    }`}
        {...props}
      >
        <span className={`flex ${expanded ? '' : 'px-[7px]'}`}>
          <span
            className={`p-[14px] rounded-[6px] ${
              !expanded &&
              (selected
                ? 'bg-button shadow-[0px_0px_10px_0px_rgba(0,0,0,0.20)]'
                : 'hover:bg-button hover:shadow-[0px_0px_10px_0px_rgba(0,0,0,0.20)]')
            }`}
          >
            <Tooltip title={expanded ? undefined : tooltip} placement="right">
              {typeof icon === 'string' ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={icon} alt={name} className="h-[26px] w-[26px]" />
              ) : (
                icon
              )}
            </Tooltip>
          </span>
        </span>
        {name && (
          <span className="flex items-center text-primary text-[1.1rem] font-medium text-left ml-[2px]">
            {name}
          </span>
        )}
      </button>
    );
  }
  return (
    <button className="flex justify-start px-[24px]" {...props}>
      <Tooltip title={tooltip} placement="right">
        {typeof icon === 'string' ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={icon} alt={name} className="h-[26px] w-[26px]" />
        ) : (
          icon
        )}
      </Tooltip>
    </button>
  );
};

export default Button;
