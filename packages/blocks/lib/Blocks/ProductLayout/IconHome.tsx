import * as React from 'react';
const HomeIcon = ({
  size,
  color = '#F9F9F9',
  ...props
}: { size?: number; color?: string } & React.SVGProps<any>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 27}
    height={size || 23}
    fill="none"
    {...props}
  >
    <path
      fill={color}
      fillRule="evenodd"
      d="M12.951.17a.97.97 0 0 1 1.098 0l12.535 8.625a.955.955 0 0 1 .372 1.074.964.964 0 0 1-.92.673h-1.929a.961.961 0 0 0-.964.958v8.625A2.884 2.884 0 0 1 20.25 23H6.75a2.884 2.884 0 0 1-2.893-2.875V11.5a.961.961 0 0 0-.964-.958H.964a.964.964 0 0 1-.92-.673.955.955 0 0 1 .371-1.074L12.951.17Zm-2.344 17.08a.961.961 0 0 0-.964.958c0 .53.431.959.964.959h5.786c.532 0 .964-.43.964-.959a.961.961 0 0 0-.964-.958h-5.786Z"
      clipRule="evenodd"
    />
  </svg>
);
export default HomeIcon;
