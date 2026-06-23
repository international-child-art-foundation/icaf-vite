import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';
import { HealingArtsHeader } from '@/modules/content/components/healingArts/HealingArtsHeader';
import { ProgramPhilosophy } from '@/modules/content/components/healingArts/ProgramPhilosophy';
import { AidMap } from '@/modules/content/components/healingArts/AidMap';
import { ImpactVideo } from '@/modules/content/components/healingArts/ImpactVideo';
import { AchievementsAndResources } from '@/modules/content/components/healingArts/AchievementsAndResources';
import YourDonations from '@/modules/content/components/shared/YourDonations';
import { Seo } from '@/modules/content/components/shared/Seo';

const healingArtsMetadata = {
  title:
    "Healing Arts Program — ICAF's Arts Therapy & Wellness Initiative",
  description:
    "ICAF's Healing Arts program uses creative expression to support children's emotional wellbeing, resilience, and recovery through arts therapy and education.",
  path: '/programs/healing-arts',
};

export const HealingArts = () => {
  return (
    <>
      <Seo {...healingArtsMetadata} />
      <div className="content-gap">
        <HealingArtsHeader />
        <ProgramPhilosophy />
        <AidMap />
        <ImpactVideo />
        <AchievementsAndResources />
        <YourDonations />
      </div>
      <PageBottomSpacer />
    </>
  );
};
