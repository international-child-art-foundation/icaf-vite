interface dashboardSplashProps {
  className: string;
  colorClass: string;
}

export const DashboardSplash = ({
  colorClass,
  className,
}: dashboardSplashProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.1"
      viewBox="0 0 1080 1920"
      preserveAspectRatio="xMidYMid slice"
      className={`${className} ${colorClass}`}
      aria-hidden="true"
    >
      <path
        id="path1"
        fill="currentColor"
        d="M -7.26,-9.68
           C -7.26,-9.68 210.54,358.16 210.54,358.16
             210.54,358.16 147.62,534.82 147.62,534.82
             147.62,534.82 273.46,885.72 273.46,885.72
             273.46,885.72 191.18,1144.66 188.76,1144.66
             186.34,1144.66 500.94,1529.44 500.94,1529.44
             500.94,1529.44 -147.62,2030.38 -147.62,2030.38
             -147.62,2030.38 -283.14,-72.60 -283.14,-72.60
             -283.14,-72.60 -7.26,-9.68 -7.26,-9.68 Z"
      ></path>
    </svg>
  );
};
