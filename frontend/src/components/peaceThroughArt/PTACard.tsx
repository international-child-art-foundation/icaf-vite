import { IPTACard } from '@/types/PeaceThroughArtTypes';
import { FlairColorMap } from '../shared/FlairColorMap';

export const PTACard = ({ title, body, color }: IPTACard) => {
  return (
    <div
      className={`${FlairColorMap[color].border} card-pad bg-background flex h-full w-full flex-col justify-between gap-7 overflow-hidden rounded-[20px] border-4 py-14 lg:justify-normal`}
    >
      <h3 className="font-montserrat text-2xl font-bold sm:text-xl lg:text-2xl">
        {title}
      </h3>
      <p className="">{body}</p>
    </div>
  );
};
