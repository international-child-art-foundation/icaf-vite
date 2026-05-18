import { SVGProps } from 'react';

export const ShareIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <circle cx="20" cy="20" r="20" fill={props.fill} />
    <path
      fill="#134380"
      d="M23.5 10.5l6 6-6 6v-3.5c-5 0-8.5 1.5-11 5 1-5 4-10 11-11v-2.5z"
    />
    <path
      fill="#134380"
      d="M13 18v11h14V21.5l2-2V31H11V16h8.5l-2 2H13z"
    />
  </svg>
);
