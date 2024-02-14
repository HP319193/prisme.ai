import { StretchContent } from '@prisme.ai/design-system';
import { ReactNode } from 'react';
import LinkItem from './LinkItem';

export interface Item {
  type: string;
  icon?: ReactNode;
  label: string;
  href?: string;
  items?: Item[];
  tooltip?: ReactNode | string;
  active?: boolean;
}

export interface RootLinksGroupProps {
  children: ReactNode;
  items: Item[];
  opened?: boolean;
}

export const RootLinksGroup = ({
  children,
  items,
  opened,
}: RootLinksGroupProps) => {
  return (
    <>
      {children}
      {items.length > 0 && (
        <StretchContent
          visible={!!opened}
          className="-mt-[30px] mb-[15px] bg-[#37465F] py-[12px] px-[30px] pr-0 flex-none"
        >
          <div className="pb-[10px]">
            {items.map((props) => (
              <LinkItem key={props.href} {...props} />
            ))}
          </div>
        </StretchContent>
      )}
    </>
  );
};

export default RootLinksGroup;
