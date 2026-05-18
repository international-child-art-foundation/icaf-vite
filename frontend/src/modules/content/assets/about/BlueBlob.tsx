import { SVGProps } from 'react';

export const BlueBlob = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="437"
    height="459"
    viewBox="0 0 437 459"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g filter="url(#filter0_d_6_10395)">
      <path
        d="M77.9897 16.0265C70.0416 15.8166 62.1233 16.8558 54.5035 19.1042C50.4846 20.2933 27.0779 27.6378 21.0596 50.8604C20.5821 52.709 19.9356 55.8466 20.0052 59.9935L37.2941 406.494C38.07 422.132 50.6935 434.483 66.172 434.953C82.1379 434.992 379.681 435.062 381.541 434.883C404.022 434.123 413.095 411.21 416.049 384.66C417.302 373.409 417.263 362.037 416.248 350.766C407.126 249.072 399.178 158.49 370.847 59.4239C364.829 38.9992 345.53 27.328 324.939 27.4279C323.606 27.4279 322.273 27.4479 320.94 27.3879C189.443 21.8621 110.628 16.8758 77.9897 16.0265Z"
        fill="#2057CC"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_6_10395"
        x="0"
        y="0"
        width="437"
        height="459"
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
          result="effect1_dropShadow_6_10395"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_6_10395"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
