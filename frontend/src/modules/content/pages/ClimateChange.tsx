import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';
import { ClimateChangeHeader } from '@/modules/content/components/climateChange/ClimateChangeHeader';
import { ClimateChangeVideos } from '@/modules/content/components/climateChange/ClimateChangeVideos';
import { ClimateChangeInfo } from '@/modules/content/components/climateChange/ClimateChangeInfo';
import { HealthAndEnvironmentDay } from '@/modules/content/components/climateChange/HealthAndEnvironmentDay';
import { Seo } from '@/modules/content/components/shared/Seo';

const climateChangeMetadata = {
  title:
    "Climate Change & the Arts — ICAF's Environmental Arts Program",
  description:
    "ICAF's climate change program engages young artists in exploring environmental themes through creativity, helping children understand and respond to our changing world.",
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
