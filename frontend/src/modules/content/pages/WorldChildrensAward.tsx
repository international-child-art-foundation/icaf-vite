import { WCAHeader } from '@/modules/content/components/worldChildrensAward/WCAHeader';
import { WCAIntro } from '@/modules/content/components/worldChildrensAward/WCAIntro';
import { WCAImportance } from '@/modules/content/components/worldChildrensAward/WCAImportance';
import { WCAGlobalLeaders } from '@/modules/content/components/worldChildrensAward/WCAGlobalLeaders';
import { WCANominations } from '@/modules/content/components/worldChildrensAward/WCANominations';
import { WCACTA } from '@/modules/content/components/worldChildrensAward/WCACTA';
import { Seo } from '@/modules/content/components/shared/Seo';
import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';

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
        <PageBottomSpacer />
      </div>
    </>
  );
};
