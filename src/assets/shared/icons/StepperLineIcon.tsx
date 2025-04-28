import { SVGProps } from 'react';

const StepperLineIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="32"
      height="364"
      viewBox="0 0 32 364"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M16 2L16 362"
        stroke="url(#paint0_linear_1599_12630)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M32 38C32 46.8366 24.8366 54 16 54C7.16344 54 0 46.8366 0 38C0 29.1634 7.16344 22 16 22C24.8366 22 32 29.1634 32 38Z"
        fill="#DA1E40"
      />
      <path
        d="M32 38C32 46.8366 24.8366 54 16 54C7.16344 54 0 46.8366 0 38C0 29.1634 7.16344 22 16 22C24.8366 22 32 29.1634 32 38Z"
        fill="#DA1E40"
      />
      <circle cx="16" cy="134" r="16" fill="#2057CC" />
      <circle cx="16" cy="326" r="16" fill="#2057CC" />
      <circle cx="16" cy="232" r="16" fill="#DA1E40" />
      <defs>
        <linearGradient
          id="paint0_linear_1599_12630"
          x1="-66"
          y1="-34.8807"
          x2="194.146"
          y2="611.72"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#DA1E40" />
          <stop offset="1" stopColor="#2057CC" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default StepperLineIcon;
