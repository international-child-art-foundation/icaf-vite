import { useRef } from 'react';
import { LeadershipHeader } from '@/modules/content/components/leadership/LeadershipHeader';
import { LeadershipBoard } from '@/modules/content/components/leadership/LeadershipBoard';
import { ImpactCallout } from '@/modules/content/components/leadership/ImpactCallout';
import YourDonations from '@/modules/content/components/shared/YourDonations';
import { ScrollToTop } from '@/modules/content/components/team/ScrollToTop';
import { Seo } from '@/modules/content/components/shared/Seo';

const leadershipMetadata = {
  title: 'ICAF Leadership — Board & Advisory Council',
  description:
    "Meet the board members and advisors who guide ICAF's mission to foster creativity, empathy, and peaceful global connections in children through the arts.",
  path: '/about/leadership',
};

export const Leadership = () => {
  const topRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <Seo {...leadershipMetadata} />
      <div ref={topRef}>
        <div className="content-gap">
          <LeadershipHeader />
          <LeadershipBoard />
          <ImpactCallout />
          <YourDonations />
          <ScrollToTop
            targetRef={topRef}
            flairColor="primaryBlue"
            offset={100}
          />
        </div>
      </div>
    </>
  );
};
