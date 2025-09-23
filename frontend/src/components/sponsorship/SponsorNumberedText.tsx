import { ISponsorImpact } from '@/types/SponsorshipTypes';
import { FlairColorMap } from '../shared/FlairColorMap';

interface SponsorNumberedTextProps {
  data: ISponsorImpact;
  orientationClass: string;
}

export const SponsorNumberedText = ({
  data,
  orientationClass,
}: SponsorNumberedTextProps) => {
  return (
    <div className={`flex flex-col gap-6 px-10 lg:w-[60%] ${orientationClass}`}>
      <p
        className={`font-montserrat text-[80px] font-semibold ${FlairColorMap[data.color].icon}`}
      >
        {data.numberLabel}
      </p>
      <div
        className={`h-1 rounded-full ${FlairColorMap[data.color].background}`}
      ></div>
      <p className="font-montserrat text-2xl font-semibold">
        {typeof data.text === 'string' ? (
          <span className={`${FlairColorMap[data.color].icon}`}>
            {data.text}
          </span>
        ) : (
          data.text
        )}
      </p>
    </div>
  );
};
