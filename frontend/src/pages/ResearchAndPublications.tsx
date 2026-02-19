import { ResearchAndPublicationsHeader } from '@/components/researchAndPublications/ResearchAndPublicationsHeader';
import { ResearchAndPublicationsDisplay } from '@/components/researchAndPublications/ResearchAndPublicationsDisplay';
import ResearchAndPublicationsContribute from '@/components/researchAndPublications/ResearchAndPublicationsContribute';

export const ResearchAndPublications = () => {
  return (
    <div>
      <div>
        <ResearchAndPublicationsHeader />
        <div className="sm: max-w-screen-2xl px-4">
          <ResearchAndPublicationsDisplay />
          <ResearchAndPublicationsContribute />
        </div>
      </div>
    </div>
  );
};
