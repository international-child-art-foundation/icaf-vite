import { ResearchAndPublicationsItem } from '@/components/researchAndPublications/ResearchAndPublicationsItem';
import { researchAndPublicationsData } from '@/data/researchAndPublications/researchAndPublicationsData';

export const ResearchAndPublicationsDisplay = () => {
  return (
    <div className="flex flex-col gap-12">
      <h2 className="font-montserrat text-center text-3xl font-bold">
        Books and articles by the ICAF Board of Directors
      </h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {researchAndPublicationsData.map((researchOrPublication) => {
          return (
            <div key={researchOrPublication.title}>
              <ResearchAndPublicationsItem {...researchOrPublication} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
