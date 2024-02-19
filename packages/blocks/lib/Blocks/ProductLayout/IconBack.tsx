import * as React from 'react';
const BackIcon = ({
  size,
  color = '#F9F9F9',
  ...props
}: { size?: number; fill?: string } & React.SVGProps<any>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 20}
    height={size || 24}
    fill="none"
    {...props}
  >
    <path
      fill={color}
      d="M8.11 8.99a1.425 1.425 0 0 0 0 2.023l7.187 7.143a1.446 1.446 0 0 0 2.035 0 1.424 1.424 0 0 0 0-2.022L11.16 10l6.168-6.134a1.425 1.425 0 0 0 0-2.023 1.446 1.446 0 0 0-2.035 0L8.105 8.986l.005.005Z"
    />
  </svg>
);
export default BackIcon;
