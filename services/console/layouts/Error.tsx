import { Button } from '@prisme.ai/design-system';
import Link from 'next/link';
import { ReactNode } from 'react';
import useLocalizedText from '../utils/useLocalizedText';
import logo from '../public/images/header-logo.svg';
import Image from 'next/image';

interface ErrorLayoutProps {
  title: string;
  description: string;
  buttons?: ReactNode[];
}

const backHome = {
  fr: "Retour à l'accueil",
};

export const ErrorLayout = ({
  title,
  description,
  buttons,
}: ErrorLayoutProps) => {
  const { localize } = useLocalizedText();
  return (
    <div className="flex flex-1 flex-col justify-center items-center bg-layout-surface text-main-text">
      <div className="absolute top-[124px]">
        <Image src={logo} alt="Prisme.ai" />
      </div>
      <div className="ml-[130px] mb-[43px]">
        <svg
          width="161"
          height="91"
          viewBox="0 0 161 91"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M86.2492 86.2383C82.341 86.2383 81.0039 89.0176 81.0039 90.7343H91.4946C91.4946 89.2629 89.9518 86.2383 86.2492 86.2383Z"
            fill="#0249C5"
          />
          <rect x="147" width="14" height="14" rx="3" fill="#FF9261" />
          <rect y="61" width="25" height="25" rx="3" fill="#BFD7FF" />
        </svg>
      </div>
      <div className="text-[48px] font-bold uppercase mb-[30px]">{title}</div>
      <div className="text-[16px] font-normal mb-[50px] max-w-[350px] text-center">
        {description}
      </div>
      <div>
        {buttons}
        <Button variant="primary">
          <Link href="/">
            <a>{localize(backHome)}</a>
          </Link>
        </Button>
      </div>
      <div className="-ml-[160px] mt-[100px]">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="14" height="14" rx="3" fill="#FF9261" />
        </svg>
      </div>
      <div className="-ml-[130px]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="16" height="16" rx="5" fill="#FFE9DF" />
        </svg>
      </div>
    </div>
  );
};

export default ErrorLayout;
