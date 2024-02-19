import Link from 'next/link';
import { ReactNode } from 'react';
import Text from './Text';
import Title from './Title';
import AngleIcon from '/icons/angle-down.svgr';

interface SingleViewLayoutProps {
  children: ReactNode;
  title: string;
  backLink: string;
}

export const SingleViewLayout = ({
  children,
  title,
  backLink,
}: SingleViewLayoutProps) => {
  return (
    <div className="bg-main-surface flex flex-col flex-1 p-[43px]">
      <Title className="flex flex-row mb-[27px] items-center">
        <Link href={backLink}>
          <a>
            <button>
              <AngleIcon
                className="rotate-90 mr-[12px]"
                height={23}
                width={23}
              />
            </button>
          </a>
        </Link>
        <Text className="flex pr-[205px] items-center text-[24px] font-semibold">
          {title}
        </Text>
      </Title>
      <div className="bg-main-element text-main-text rounded flex flex-col items-center justify-center flex-1">
        {children}
      </div>
    </div>
  );
};

export default SingleViewLayout;
