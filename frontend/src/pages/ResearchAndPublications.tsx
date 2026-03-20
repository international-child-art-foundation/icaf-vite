import { ResearchAndPublicationsHeader } from '@/components/researchAndPublications/ResearchAndPublicationsHeader';
import { ResearchAndPublicationsDisplay } from '@/components/researchAndPublications/ResearchAndPublicationsDisplay';
import ResearchAndPublicationsContribute from '@/components/researchAndPublications/ResearchAndPublicationsContribute';
import { PageBottomSpacer } from '@/components/shared/PageBottomSpacer';

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
