import { HealingArtsHeader } from '@/components/healingArts/HealingArtsHeader';
import { ProgramPhilosophy } from '@/components/healingArts/ProgramPhilosophy';
import { AidMap } from '@/components/healingArts/AidMap';
import { ImpactVideo } from '@/components/healingArts/ImpactVideo';
import { AchievementsAndResources } from '@/components/healingArts/AchievementsAndResources';
import YourDonations from '@/components/shared/YourDonations';
import { Seo } from '@/components/shared/Seo';

const healingArtsMetadata = {
  title: 'Healing Arts | ICAF',
  description:
    "Learn about ICAF's initiatives to help children heal from the effects of natural disasters.",
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
    </>
  );
};
