import { SVGProps } from 'react';

export const YoutubeIcon = (props: SVGProps<SVGSVGElement>) => (
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
      d="M29.543 14.498C30 16.28 30 20 30 20C30 20 30 23.72 29.543 25.502C29.289 26.487 28.546 27.262 27.605 27.524C25.896 28 20 28 20 28C20 28 14.107 28 12.395 27.524C11.45 27.258 10.708 26.484 10.457 25.502C10 23.72 10 20 10 20C10 20 10 16.28 10.457 14.498C10.711 13.513 11.454 12.738 12.395 12.476C14.107 12 20 12 20 12C20 12 25.896 12 27.605 12.476C28.55 12.742 29.292 13.516 29.543 14.498ZM18 23.5L24 20L18 16.5V23.5Z"
    />
  </svg>
);
