import YourDonations from '@/components/shared/YourDonations';
import { StudentHeader } from '@/components/student/StudentHeader';
import { StudentCreativity } from '@/components/student/StudentCreativity';
import { StudentEmpathyTeamwork } from '@/components/student/StudentEmpathyTeamwork';
import { JoinTheFun } from '@/components/student/JoinTheFun';
import { SpreadCreativity } from '@/components/student/SpreadCreativity';

export const Student = () => {
  return (
    <div>
      <StudentHeader />
      <div className="flex max-w-screen-2xl flex-col gap-12 px-8 md:px-12 lg:px-16 xl:px-20">
        <StudentCreativity />
        <StudentEmpathyTeamwork />
      </div>
      <JoinTheFun />
      <SpreadCreativity />
      <YourDonations />
    </div>
  );
};
