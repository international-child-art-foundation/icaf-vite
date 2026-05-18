import { SVGProps } from 'react';

export const RedBlob = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="362"
    height="451"
    viewBox="0 0 362 451"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g filter="url(#filter0_d_6_10397)">
      <path
        d="M326.441 79.7066C347.752 385.284 386.516 304.175 129.54 423.607C125.003 425.713 120.068 426.881 115.064 426.981C98.707 427.331 89.7922 422.818 82.0615 413.864C78.6389 409.891 76.1913 405.169 74.7785 400.108C67.585 374.303 40.6716 277.452 22.6034 208.632L21.9268 205.497C17.0316 176.408 20.902 163.011 40.0547 147.648L43.8057 144.993C118.845 98.7434 225.046 36.3621 236.189 29.8335L237.831 28.8053C240.318 27.1482 249.153 21.488 258.545 18.074C266.137 15.3088 274.475 15.3487 282.126 17.9542C309.218 27.1582 323.476 48.6707 326.431 79.7066H326.441Z"
        fill="#D32413"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_6_10397"
        x="0"
        y="0"
        width="362"
        height="451"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="4" />
        <feGaussianBlur stdDeviation="10" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_6_10397"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_6_10397"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
