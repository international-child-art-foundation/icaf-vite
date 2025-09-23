import { IExperimentalBrandingCard } from '@/types/SponsorshipTypes';
import { FlairColorMap } from '../shared/FlairColorMap';

interface ExperimentalBrandingCardProps {
  data: IExperimentalBrandingCard;
}

export const ExperimentalBrandingCard = ({
  data,
}: ExperimentalBrandingCardProps) => {
  return (
    <div
      className={`relative grid h-[650px] grid-rows-10 overflow-hidden rounded-3xl border-4 ${FlairColorMap[data.color].border} select-none`}
    >
      <div className="row-span-8 row-start-1">
        {data.largeImgSrc ? (
          <img
            src={data.largeImgSrc}
            alt=""
            className="min-h-full min-w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-300">
            <p className="text-3xl font-bold">Placeholder</p>
          </div>
        )}
      </div>

      <div className="row-span-2 row-start-9 flex items-center">
        {data.logoSrc ? (
          <img
            src={data.logoSrc}
            alt=""
            className="mx-auto h-full w-auto object-contain p-4"
          />
        ) : (
          <p className="mx-auto p-4">Logo</p>
        )}
      </div>
    </div>
  );
};
