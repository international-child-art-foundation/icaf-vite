interface DiamondShapeProps {
  color: string;
  day: string;
  lineDescription: string;
  alignDirection: string;
}

export const DiamondShape = ({
  color,
  day,
  lineDescription,
  alignDirection,
}: DiamondShapeProps) => {
  return (
    <div className="relative flex justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="53"
        height="67"
        viewBox="0 0 53 67"
        fill="none"
        className="z-10"
      >
        <path
          d="M26.4246 0L27.6686 9.83242C29.1471 21.5193 38.2318 30.8519 49.9931 32.7661L52.8493 33.231L49.9931 33.6958C38.2318 35.6101 29.1471 44.9426 27.6686 56.6295L26.4246 66.462L25.1807 56.6296C23.7022 44.9426 14.6175 35.6101 2.85618 33.6958L0 33.231L2.85618 32.7661C14.6175 30.8519 23.7022 21.5194 25.1807 9.83243L26.4246 0Z"
          fill={color}
        />
      </svg>
      <div className={`bg-primary absolute ${lineDescription} w-1`} />
      {/* Red Dotted Line + Pill */}
      {alignDirection === 'right' ? (
        <div className={`absolute left-10 top-3 flex items-center gap-2`}>
          <div className="h-px w-12 border-t-2 border-dashed border-[#DA1E40] xl:w-20 2xl:w-28" />
          <div className="w-[100px] rounded-full bg-[#DA1E40] px-4 py-2 text-center text-lg font-semibold text-white">
            {day}
          </div>
        </div>
      ) : (
        <div className={`absolute right-10 top-3 flex items-center gap-2`}>
          <div className="w-[100px] rounded-full bg-[#DA1E40] px-4 py-2 text-center text-lg font-semibold text-white">
            {day}
          </div>
          <div className="h-px w-12 border-t-2 border-dashed border-[#DA1E40] xl:w-20 2xl:w-28" />
        </div>
      )}
    </div>
  );
};
