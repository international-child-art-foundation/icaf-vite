import handshake from '@/assets/sponsorship/handshake.svg';
import { ExperientialBrandingCarousel } from './ExperientialBrandingCarousel';
import groupIcon from '@/assets/sponsorship/GroupIcon.svg';
import { BrandImpactCarousel } from './BrandImpactCarousel';

export const BrandImpact = () => {
  return (
    <div className="flex max-w-screen-2xl flex-col gap-10">
      <p className="font-montserrat text-center text-[32px] font-bold">
        Brand Impact Examples
      </p>
      <div className="bg-tertiary-red flex flex-col items-center gap-6 rounded-[20px] py-6 text-center md:gap-10 md:py-10">
        <img src={handshake} className="mx-auto" />
        <p className="font-montserrat text-2xl font-semibold text-white">
          Cause Marketing
        </p>
      </div>
      <BrandImpactCarousel />
      <div>
        <div className="bg-tertiary-blue flex flex-col items-center gap-6 rounded-[20px] py-6 text-center md:gap-10 md:py-10">
          <img src={groupIcon} className="mx-auto" />
          <p className="font-montserrat text-2xl font-semibold text-white">
            Experiential Branding
          </p>
        </div>

        <ExperientialBrandingCarousel />
      </div>
    </div>
  );
};
