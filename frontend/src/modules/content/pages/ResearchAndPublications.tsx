import { ResearchAndPublicationsHeader } from '@/modules/content/components/researchAndPublications/ResearchAndPublicationsHeader';
import { ResearchAndPublicationsDisplay } from '@/modules/content/components/researchAndPublications/ResearchAndPublicationsDisplay';
import ResearchAndPublicationsContribute from '@/modules/content/components/researchAndPublications/ResearchAndPublicationsContribute';
import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';
import { Seo } from '@/modules/content/components/shared/Seo';

const researchAndPublicationsMetadata = {
  title: 'ICAF Research & Publications — Arts Education Resources',
  description:
    "Explore ICAF's research, publications, and resources on arts education, creativity development, and the impact of arts programs on children's empathy and learning.",
  path: '/about/research-and-publications',
};

export const ResearchAndPublications = () => {
  return (
    <>
      <Seo {...researchAndPublicationsMetadata} />
      <div className="content-gap">
        <ResearchAndPublicationsHeader />
        <ResearchAndPublicationsDisplay />
        <ResearchAndPublicationsContribute />
      </div>
      <PageBottomSpacer />
    </>
  );
};
