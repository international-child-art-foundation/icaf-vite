import handshake from '@/assets/sponsorship/handshake.svg';
import { brandCampaignCardData } from '@/data/sponsorship/BrandCampaignCardData';
import { BrandCampaignCard } from './BrandCampaignCard';

export const BrandImpact = () => {
  return (
    <div className="flex max-w-screen-2xl flex-col gap-10 px-8 md:px-12 lg:px-16 xl:px-20">
      <p className="font-montserrat text-center text-[32px] font-bold">
        Brand Impact Examples
      </p>
      <div className="bg-tertiary-red flex flex-col items-center gap-6 rounded-[20px] py-6 text-center md:gap-10 md:py-10">
        <img src={handshake} className="mx-auto" />
        <p className="font-montserrat text-2xl font-semibold text-white">
          Cause Marketing
        </p>
      </div>
      <div className="grid grid-cols-3 grid-rows-1 gap-4">
        {brandCampaignCardData.map((data) => (
          <BrandCampaignCard key={data.id} {...data} />
        ))}
      </div>
    </div>
  );
};
