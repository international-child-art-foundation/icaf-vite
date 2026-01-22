import { ResearchAndPublicationsHeader } from '@/components/researchAndPublications/ResearchAndPublicationsHeader';
import { ResearchAndPublicationsDisplay } from '@/components/researchAndPublications/ResearchAndPublicationsDisplay';

export const ResearchAndPublications = () => {
  return (
    <div>
      <div>
        <ResearchAndPublicationsHeader />
        <div className="max-w-screen-2xl px-8 md:px-12 lg:px-16 xl:px-20">
          <ResearchAndPublicationsDisplay />
        </div>
      </div>
    </div>
  );
};
