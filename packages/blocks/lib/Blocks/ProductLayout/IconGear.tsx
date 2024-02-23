import * as React from 'react';
const GearIcon = ({
  size,
  color = '#F9F9F9',
  ...props
}: { size?: number; color?: string } & React.SVGProps<any>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 17}
    height={size || 18}
    fill="none"
    {...props}
  >
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M8.5 11.182c1.187 0 2.15-.977 2.15-2.182S9.687 6.818 8.5 6.818c-1.187 0-2.15.977-2.15 2.182s.963 2.182 2.15 2.182Z"
    />
    <path
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeWidth={1.5}
      d="M15.858 12.058a1.1 1.1 0 0 0-.383-1.478l-.018-.011c-.39-.237-.58-.696-.532-1.154.015-.144.024-.284.024-.415s-.01-.271-.024-.415c-.049-.458.141-.917.532-1.153l.018-.012a1.1 1.1 0 0 0 .383-1.478l-1.095-1.945a1.041 1.041 0 0 0-1.449-.386c-.392.237-.886.182-1.263-.078a5.76 5.76 0 0 0-.687-.408c-.41-.206-.714-.608-.714-1.072C10.65 1.472 10.185 1 9.612 1H7.415c-.588 0-1.065.484-1.065 1.08 0 .454-.282.85-.685 1.047-.252.123-.489.258-.713.41-.381.255-.874.311-1.266.074a1.041 1.041 0 0 0-1.449.386L1.142 5.942a1.1 1.1 0 0 0 .382 1.478l.02.012c.39.236.58.695.531 1.153A4.024 4.024 0 0 0 2.051 9c0 .131.01.271.024.415.049.458-.141.917-.532 1.154l-.019.01a1.1 1.1 0 0 0-.382 1.48l1.095 1.944c.292.517.945.691 1.449.386.392-.237.886-.182 1.263.078.22.152.45.29.687.409.41.205.714.607.714 1.07 0 .582.465 1.054 1.038 1.054h2.197c.588 0 1.065-.484 1.065-1.08 0-.454.282-.85.685-1.047.252-.123.489-.258.713-.41.381-.255.874-.311 1.266-.074a1.041 1.041 0 0 0 1.449-.386l1.095-1.945Z"
    />
  </svg>
);
export default GearIcon;