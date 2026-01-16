import { LeadershipHeader } from '@/components/leadership/LeadershipHeader';
import { LeadershipBoard } from '@/components/leadership/LeadershipBoard';
import { ImpactCallout } from '@/components/leadership/ImpactCallout';

export const Leadership = () => {
  return (
    <div>
      <div>
        <LeadershipHeader />
        <div className="flex max-w-screen-2xl flex-col gap-20 px-8 md:px-12 lg:px-16 xl:px-20">
          <LeadershipBoard />
          <ImpactCallout />
        </div>
      </div>
    </div>
  );
};
