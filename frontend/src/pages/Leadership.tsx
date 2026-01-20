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
      <div>
        <LeadershipHeader />
        <div className="flex max-w-screen-2xl flex-col gap-20 px-8 md:px-12 lg:px-16 xl:px-20">
          <LeadershipBoard />
          <ImpactCallout />
        </div>
        <YourDonations />
        <ScrollToTop targetRef={topRef} flairColor="primaryBlue" offset={100} />
      </div>
    </div>
  );
};
