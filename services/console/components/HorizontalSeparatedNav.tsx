import {
  Children,
  cloneElement,
  FC,
  ReactChild,
  ReactChildren,
  useMemo,
} from 'react';

interface HorizontalSeparatedNavProps {
  children: ReactChild | (ReactChild | undefined)[];
}
interface Separator extends HorizontalSeparatedNavProps {
  borderLeft?: boolean;
  borderRight?: boolean;
}

export const HorizontalSeparatedNav = ({
  children,
}: HorizontalSeparatedNavProps) => {
  const childrenAsArray = useMemo(
    () => (Array.isArray(children) ? children : [children]),
    [children]
  );
  return (
    <div className="flex flex-row items-center text-lg font-medium">
      {Children.map(childrenAsArray, (c, k) =>
        typeof c === 'object'
          ? cloneElement(c, {
              borderLeft: k !== 0,
              borderRight: k !== childrenAsArray.length - 1,
            })
          : c
      )}
    </div>
  );
};

export const Separator = ({ children, borderLeft, borderRight }: Separator) => {
  return (
    <span
      className={`text-gray text-base flex ${borderRight ? 'border-r' : ''} ${
        borderLeft ? 'border-l' : ''
      } border-solid  h-[26px] items-center px-4`}
    >
      {children}
    </span>
  );
};

HorizontalSeparatedNav.Separator = Separator;

export default HorizontalSeparatedNav;
