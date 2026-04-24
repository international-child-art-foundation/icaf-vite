export type FlairDiamondProps = {
  colorClass: string; // expects a tailwind variable as class (e.g. text-secondary-blue)
  className?: string;
  width?: string;
  height?: string;
};

export const FlairDiamond = ({
  colorClass,
  className,
  width = '200',
  height = '200',
}: FlairDiamondProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 362 450"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={`${colorClass} ${className}`}
    >
      <g filter="url(#flairDiamondShadow)">
        <path
          d="M35.5191 79.4806C14.229 384.618 -24.3951 303.725 232.319 422.985C236.851 425.088 241.305 425.881 246.304 425.981C262.645 426.33 271.548 421.941 279.271 412.999C282.69 409.032 285.851 405.072 287.263 400.018C294.449 374.25 321.16 277.016 339.21 208.295L340.209 205.299C345.099 176.252 340.361 162.724 321.228 147.383L318.231 144.387C243.268 98.2042 136.56 36.0718 125.427 29.5526L124.429 28.5541C121.944 26.8993 112.833 21.9776 103.45 18.5685C95.8661 15.8073 87.1177 14.9682 79.4743 17.5699C52.4094 26.7606 38.4711 48.4894 35.5191 79.4806Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <filter
          id="flairDiamondShadow"
          x="0"
          y="0"
          width="362"
          height="450"
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
