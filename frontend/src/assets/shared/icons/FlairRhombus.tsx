export type FlairRhombusProps = {
  colorClass: string; // expects a tailwind variable as class (e.g. text-secondary-blue)
  className?: string;
  width?: string;
  height?: string;
};

export const FlairRhombus = ({
  colorClass,
  className,
  width = '200',
  height = '200',
}: FlairRhombusProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 344 398"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${colorClass} ${className}`}
    >
      <g filter="url(#flairRhombusShadow)">
        <path
          d="M64.0552 16.048C57.9656 15.8683 51.9423 16.1217 46.1042 18.0473C43.0251 19.0658 24.7861 25.1477 20.1751 45.0379C19.8093 46.6213 20.1218 49.4833 20.1751 53.0351L33.1397 349.932C33.7342 363.326 43.2206 373.521 55.0797 373.923C67.3123 373.958 294.995 374.077 296.42 373.923C313.645 373.273 321.083 353.679 323.347 330.938C324.307 321.301 324.124 311.603 323.347 301.948C316.358 214.847 310.148 137.885 288.442 53.0351C283.831 35.5413 269.314 24.9593 253.537 25.0449C252.516 25.0449 251.567 25.0963 250.546 25.0449C149.796 20.312 89.0614 16.7755 64.0552 16.048Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <filter
          id="flairRhombusShadow"
          x="0"
          y="0"
          width="344"
          height="398"
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
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
