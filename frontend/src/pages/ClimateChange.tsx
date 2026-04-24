import { PageBottomSpacer } from '@/components/shared/PageBottomSpacer';
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
      <div className="content-gap">
        <ClimateChangeHeader />
        <ClimateChangeInfo />
        <HealthAndEnvironmentDay />
        <ClimateChangeVideos />
      </div>
      <PageBottomSpacer />
    </>
  );
};
