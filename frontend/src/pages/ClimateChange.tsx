import { ClimateChangeHeader } from '@/components/climateChange/ClimateChangeHeader';
import { ClimateChangeIntro } from '@/components/climateChange/ClimateChangeIntro';
import { ClimateChangeVideos } from '@/components/climateChange/ClimateChangeVideos';

export const ClimateChange = () => {
  return (
    <div>
      <div className="flex flex-col gap-8">
        <ClimateChangeHeader />
        <div className="flex max-w-screen-2xl flex-col gap-8 px-8 md:px-12 lg:px-16 xl:px-20">
          <ClimateChangeIntro />
          <ClimateChangeVideos />
        </div>
      </div>
    </div>
  );
};
