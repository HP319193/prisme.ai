import { Tooltip } from 'antd';
import { FC, HTMLAttributes, useEffect, useRef, useState } from 'react';

interface TruncatedProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  ellipsis?: string;
}

export const Truncated: FC<TruncatedProps> = ({
  className,
  children,
  ellipsis,
  ...props
}) => {
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
    <Tooltip title={isTruncated && children}>
      <div ref={refContainer} className={`relative ${className}`} {...props}>
        <div ref={refOverflowed}>{children}</div>
        {isTruncated && ellipsis && (
          <div className="absolute bottom-0 right-0">{ellipsis}</div>
        )}
      </div>
    </Tooltip>
  );
};

export default Truncated;
