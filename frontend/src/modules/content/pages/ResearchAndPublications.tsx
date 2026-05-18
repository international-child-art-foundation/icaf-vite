import { ResearchAndPublicationsHeader } from '@/modules/content/components/researchAndPublications/ResearchAndPublicationsHeader';
import { ResearchAndPublicationsDisplay } from '@/modules/content/components/researchAndPublications/ResearchAndPublicationsDisplay';
import ResearchAndPublicationsContribute from '@/modules/content/components/researchAndPublications/ResearchAndPublicationsContribute';
import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';

export const ResearchAndPublications = () => {
  return (
    <>
      <div className="content-gap">
        <ResearchAndPublicationsHeader />
        <ResearchAndPublicationsDisplay />
        <ResearchAndPublicationsContribute />
      </div>
      <PageBottomSpacer />
    </>
  );
};
