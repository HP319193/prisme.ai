import down from '../../../console/icons/down.svg';
import Image from 'next/image';

export const DownIcon = ({ className }: { className?: string }) => (
  <Image src={down.src} width={14} height={14} alt="" className={className} />
);

export default DownIcon;
