import { useRef } from 'react';
import { LeadershipHeader } from '@/components/leadership/LeadershipHeader';
import { LeadershipBoard } from '@/components/leadership/LeadershipBoard';
import { ImpactCallout } from '@/components/leadership/ImpactCallout';
import YourDonations from '@/components/shared/YourDonations';
import { ScrollToTop } from '@/components/team/ScrollToTop';

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
