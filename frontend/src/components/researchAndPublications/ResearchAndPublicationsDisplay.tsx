import { ResearchAndPublicationsItem } from '@/components/researchAndPublications/ResearchAndPublicationsItem';
import { researchAndPublicationsData } from '@/data/researchAndPublications/researchAndPublicationsData';

export const ResearchAndPublicationsDisplay = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {researchAndPublicationsData.map((researchOrPublication) => {
        return (
          <div key={researchOrPublication.title}>
            <ResearchAndPublicationsItem {...researchOrPublication} />
          </div>
        );
      })}
    </div>
  );
};
