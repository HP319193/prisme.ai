import * as React from 'react';
const ShareIcon = ({
  size,
  color = '#F9F9F9',
  ...props
}: { size?: number; color?: string } & React.SVGProps<any>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 15}
    height={size || 17}
    fill="none"
    {...props}
  >
    <path
      fill={color}
      fillRule="evenodd"
      d="M12 1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM9 3a3 3 0 1 1 .869 2.111L5.887 7.434a3.001 3.001 0 0 1 0 1.632L9.87 11.39a3 3 0 1 1-.756 1.295L5.13 10.36a3 3 0 1 1 0-4.223l3.982-2.322A3.001 3.001 0 0 1 9 3ZM3 6.75a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM12 12a1.499 1.499 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
      clipRule="evenodd"
    />
  </svg>
);
export default ShareIcon;
