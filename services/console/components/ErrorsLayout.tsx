import icon from '../icons/icon-prisme.svg';
import Image from 'next/image';
import { FC } from 'react';

export const ErrorsLayout: FC = ({ children }) => (
  <div className="flex flex-1 flex-col-reverse md:flex-row overflow-y-auto">
    <div className="!flex flex-col bg-gradient-to-br from-[#0A1D3B] to-[#0F2A54] items-center justify-center md:w-[40vw]">
      <div className="flex invisible md:visible flex-col flex-1 justify-center w-full space-y-4 lg:space-y-6">
        <div className="w-1/2 h-4 lg:h-8 bg-accent rounded-r-[100rem]" />
        <div className="w-1/2 h-4 lg:h-8 bg-pr-orange rounded-r-[100rem]" />
        <div className="w-1/2 h-4 lg:h-8 bg-pr-grey rounded-r-[100rem]" />
      </div>
      <div className="flex flex-1 flex-col justify-end mb-10">
        <div className="flex items-center flex-col text-white p-[10%]">
          <div className="font-normal text-[1rem] md:text-[2rem] xl:text-[3.375rem] leading-normal">
            <div className="flex flex-row  mt-20">
              <Image src={icon} width={16} height={16} alt="Prisme.ai" />
              <div className="ml-2 !font-light tracking-[.4em] text-[1.125rem]">
                PRISME.AI
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="!flex flex-1 items-center justify-center md:w-[60vw] md:h-[100vh]">
      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center space-y-4 mb-16 mt-8">
          <div className="text-accent !font-light tracking-[.3em]">Error</div>
          {children}
        </div>
      </div>
    </div>
  </div>
);

export default ErrorsLayout;
