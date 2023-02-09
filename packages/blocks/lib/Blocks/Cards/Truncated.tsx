import { Tooltip } from 'antd';
import {
  HTMLAttributes,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { truncate } from '../../utils/truncate';

interface TruncatedProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  ellipsis?: string;
  children: (text: string) => ReactElement | string;
  text: string;
}

export const Truncated = ({
  className,
  children,
  text,
  ellipsis,
  ...props
}: TruncatedProps) => {
  const refContainer = useRef<HTMLDivElement>(null);
  const refOverflowed = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (!refOverflowed.current || !refContainer.current) return;
    const { height: oH } = refOverflowed.current.getBoundingClientRect();
    const { height: cH } = refContainer.current.getBoundingClientRect();
    setIsTruncated(oH > cH);
  }, []);

  return (
    <Tooltip title={isTruncated && truncate(`${text}`, 350)}>
      <div ref={refContainer} className={`relative ${className}`} {...props}>
        <div ref={refOverflowed}>{children(text)}</div>
        {isTruncated && ellipsis && (
          <div className="absolute bottom-0 right-0">{ellipsis}</div>
        )}
      </div>
    </Tooltip>
  );
};

export default Truncated;
