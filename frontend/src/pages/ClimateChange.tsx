import { ClimateChangeHeader } from '@/components/climateChange/ClimateChangeHeader';
import { ClimateChangeVideos } from '@/components/climateChange/ClimateChangeVideos';
import { ClimateChangeInfo } from '@/components/climateChange/ClimateChangeInfo';
import { HealthAndEnvironmentDay } from '@/components/climateChange/HealthAndEnvironmentDay';

export const ClimateChange = () => {
  return (
    <div>
      <div className="flex flex-col gap-8">
        <ClimateChangeHeader />
        <div className="flex max-w-screen-2xl flex-col gap-24 px-8 md:px-12 lg:px-16 xl:px-20">
          <ClimateChangeInfo />
          <HealthAndEnvironmentDay />
          <ClimateChangeVideos />
        </div>
      </div>
    </div>
  );
};
