import { IBrandCampaignCard } from '@/types/SponsorshipTypes';

interface BrandCampaignCardProps {
  data: IBrandCampaignCard;
  isActive: boolean;
}

export const BrandCampaignCard = ({
  data,
  isActive,
}: BrandCampaignCardProps) => {
  return (
    <div
      className={`${isActive ? 'scale-100' : 'scale-90'} relative select-none transition-transform duration-300`}
    >
      <div className="border-tertiary-red relative flex flex-col overflow-hidden rounded-xl border-4">
        {data.mainImg ? (
          <img className="" src={data.mainImg} />
        ) : (
          <div className="relative aspect-[9/12] h-full bg-gray-300">
            <p className="text-3xl font-bold">Placeholder</p>
          </div>
        )}
        <div className="bg-background">
          {data.logo ? (
            <img className="mx-auto w-24" src={data.logo} />
          ) : (
            <p>Logo</p>
          )}
        </div>
      </div>
    </div>
  );
};
