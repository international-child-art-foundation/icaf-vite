import { IPTACard } from '@/types/PeaceThroughArtTypes';
import { FlairColorMap } from '../shared/FlairColorMap';

export const PTACard = ({ title, body, color }: IPTACard) => {
  return (
    <div
      className={`${FlairColorMap[color].border} bg-background flex h-full w-full flex-col justify-between gap-7 overflow-hidden rounded-[20px] border-4 px-4 py-14 lg:justify-normal lg:px-9`}
    >
      <p className="font-montserrat text-left text-2xl font-bold sm:text-xl lg:text-2xl">
        {title}
      </p>
      <p className="text-left">{body}</p>
    </div>
  );
};
