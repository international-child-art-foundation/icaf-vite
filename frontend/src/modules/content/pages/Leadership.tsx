import { useRef } from 'react';
import { LeadershipHeader } from '@/modules/content/components/leadership/LeadershipHeader';
import { LeadershipBoard } from '@/modules/content/components/leadership/LeadershipBoard';
import { ImpactCallout } from '@/modules/content/components/leadership/ImpactCallout';
import YourDonations from '@/modules/content/components/shared/YourDonations';
import { ScrollToTop } from '@/modules/content/components/team/ScrollToTop';

export const Leadership = () => {
  const topRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={topRef}>
      <div className="content-gap">
        <LeadershipHeader />
        <LeadershipBoard />
        <ImpactCallout />
        <YourDonations />
        <ScrollToTop targetRef={topRef} flairColor="primaryBlue" offset={100} />
      </div>
    </div>
  );
};
