import { ClimateChangeHeader } from '@/components/climateChange/ClimateChangeHeader';
import { ClimateChangeVideos } from '@/components/climateChange/ClimateChangeVideos';
import { ClimateChangeInfo } from '@/components/climateChange/ClimateChangeInfo';
import { HealthAndEnvironmentDay } from '@/components/climateChange/HealthAndEnvironmentDay';
import { Seo } from '@/components/shared/Seo';

const climateChangeMetadata = {
  title: 'Climate Change | ICAF',
  description:
    "ICAF is committed to spreading awareness about climate change and its impact on our childrens' future.",
  path: '/programs/climate-change',
};

export const ClimateChange = () => {
  return (
    <>
      <Seo {...climateChangeMetadata} />
      <div>
        <div className="flex flex-col gap-8">
          <ClimateChangeHeader />
          <div className="max-w-screen-3xl flex flex-col gap-24 px-8 md:px-12 lg:px-16 xl:px-20">
            <ClimateChangeInfo />
            <HealthAndEnvironmentDay />
            <ClimateChangeVideos />
          </div>
        </div>
      </div>
    </>
  );
};
