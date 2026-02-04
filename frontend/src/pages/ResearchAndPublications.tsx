import { ResearchAndPublicationsHeader } from '@/components/researchAndPublications/ResearchAndPublicationsHeader';
import { ResearchAndPublicationsDisplay } from '@/components/researchAndPublications/ResearchAndPublicationsDisplay';
import ResearchAndPublicationsContribute from '@/components/researchAndPublications/ResearchAndPublicationsContribute';

export const ResearchAndPublications = () => {
  return (
    <div>
      <div>
        <ResearchAndPublicationsHeader />
        <div className="max-w-screen-3xl px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <ResearchAndPublicationsDisplay />
          <ResearchAndPublicationsContribute />
        </div>
      </div>
    </div>
  );
};
