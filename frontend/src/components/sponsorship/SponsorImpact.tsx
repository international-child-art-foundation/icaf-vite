import { SponsorImpactData } from '@/data/sponsorship/sponsorImpactData';
import { SponsorNumberedText } from './SponsorNumberedText';
import { FireworkSnowflake } from '@/assets/shared/icons/FireworkSnowflake';

export const SponsorImpact = () => {
  return (
    <div className="relative flex max-w-screen-2xl flex-col gap-10">
      {SponsorImpactData.map((dataPoint, idx) => (
        <div key={dataPoint.key} className="w-full">
          <SponsorNumberedText
            data={dataPoint}
            orientationClass={idx % 2 != 0 ? 'ml-auto' : 'mr-auto'}
          />
        </div>
      ))}
      <FireworkSnowflake
        colorClass="text-secondary-blue"
        className="absolute right-0 top-4 h-24 w-24 md:right-24 lg:h-48 lg:w-48"
      />
    </div>
  );
};
