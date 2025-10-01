import { HealingArtsHeader } from '@/components/healingArts/HealingArtsHeader';
import { ProgramPhilosophy } from '@/components/healingArts/ProgramPhilosophy';
import { AidMap } from '@/components/healingArts/AidMap';
import { ImpactVideo } from '@/components/healingArts/ImpactVideo';
import { AchievementsAndResources } from '@/components/healingArts/AchievementsAndResources';

export const HealingArts = () => {
  return (
    <div className="">
      <HealingArtsHeader />
      <div className="flex max-w-screen-2xl flex-col gap-12 px-8 md:px-12 lg:px-16 xl:px-20">
        <ProgramPhilosophy />
        <AidMap />
        <ImpactVideo />
        <AchievementsAndResources />
      </div>
    </div>
  );
};
