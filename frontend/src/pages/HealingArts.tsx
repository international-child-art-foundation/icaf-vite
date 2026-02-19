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
      <div className="">
        <HealingArtsHeader />
        <div className="flex max-w-screen-2xl flex-col gap-12">
          <ProgramPhilosophy />
          <AidMap />
          <ImpactVideo />
          <AchievementsAndResources />
        </div>
        <div className="mt-12">
          <YourDonations />
        </div>
      </div>
    </>
  );
};
