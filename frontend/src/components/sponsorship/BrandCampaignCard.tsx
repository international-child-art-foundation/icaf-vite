import { IBrandCampaignCard } from '@/types/SponsorshipBrandCampaignCard';

export const BrandCampaignCard = ({ mainImg, logo }: IBrandCampaignCard) => {
  return (
    <div className="">
      <div className="border-tertiary-red overflow-hidden rounded-xl border-2">
        <img className="" src={mainImg} />
        <div className="bg-background">
          {logo && <img className="mx-auto w-24" src={logo} />}
        </div>
      </div>
    </div>
  );
};
