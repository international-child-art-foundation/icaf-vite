import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';
import { ClimateChangeHeader } from '@/modules/content/components/climateChange/ClimateChangeHeader';
import { ClimateChangeVideos } from '@/modules/content/components/climateChange/ClimateChangeVideos';
import { ClimateChangeInfo } from '@/modules/content/components/climateChange/ClimateChangeInfo';
import { HealthAndEnvironmentDay } from '@/modules/content/components/climateChange/HealthAndEnvironmentDay';
import { Seo } from '@/modules/content/components/shared/Seo';

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
