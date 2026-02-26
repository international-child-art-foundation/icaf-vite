import { WCAHeader } from '@/components/worldChildrensAward/WCAHeader';
import { WCAIntro } from '@/components/worldChildrensAward/WCAIntro';
import { WCAImportance } from '@/components/worldChildrensAward/WCAImportance';
import { WCAGlobalLeaders } from '@/components/worldChildrensAward/WCAGlobalLeaders';
import { WCANominations } from '@/components/worldChildrensAward/WCANominations';
import { WCACTA } from '@/components/worldChildrensAward/WCACTA';
import { Seo } from '@/components/shared/Seo';

const worldChildrensAwardMetadata = {
  title: "World Children's Award | ICAF",
  description:
    "ICAF's World Children's Award allows young people to honor their favorite businesses, philanthropies, and cultural and educational leaders.",
  path: '/programs/world-childrens-award',
};

export const WorldChildrensAward = () => {
  return (
    <>
      <Seo {...worldChildrensAwardMetadata} />
      <div>
        <div className="content-gap">
          <WCAHeader />
          <WCAIntro />
          <WCAImportance />
          <WCAGlobalLeaders />
          <WCANominations />
          <WCACTA />
        </div>
      </div>
    </>
  );
};
