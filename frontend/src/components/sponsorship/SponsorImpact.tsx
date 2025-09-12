import { SponsorImpactData } from '@/data/sponsorship/sponsorImpactData';
import { SponsorNumberedText } from './SponsorNumberedText';

export const SponsorImpact = () => {
  return (
    <div className="flex max-w-screen-2xl flex-col gap-10 px-8 md:px-12 lg:px-16 xl:px-20">
      {SponsorImpactData.map((dataPoint, idx) => (
        <div key={dataPoint.key} className="w-full">
          <SponsorNumberedText
            data={dataPoint}
            orientationClass={idx % 2 != 0 ? 'ml-auto' : 'mr-auto'}
          />
        </div>
      ))}
      <div></div>
    </div>
  );
};
