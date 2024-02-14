import * as React from 'react';
const ExpandIcon = ({
  size = 16,
  color = '#F9F9F9',
  ...props
}: { size?: number; fill?: string } & React.SVGProps<any>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    {...props}
  >
    <path
      fill={color}
      fillRule="evenodd"
      d="M.335 13.658a1.184 1.184 0 0 1 0-1.65L5.24 7 .335 1.992a1.184 1.184 0 0 1 0-1.65 1.126 1.126 0 0 1 1.616 0l5.714 5.833C7.88 6.394 8 6.691 8 7c0 .31-.12.606-.335.825l-5.714 5.833a1.126 1.126 0 0 1-1.616 0Zm8 0a1.184 1.184 0 0 1 0-1.65L13.24 7 8.335 1.992a1.184 1.184 0 0 1 0-1.65 1.126 1.126 0 0 1 1.616 0l5.714 5.833a1.184 1.184 0 0 1 0 1.65l-5.714 5.833a1.126 1.126 0 0 1-1.616 0Z"
      clipRule="evenodd"
    />
  </svg>
);
export default ExpandIcon;
