import { PageBottomSpacer } from '@/components/shared/PageBottomSpacer';
import YourDonations from '@/components/shared/YourDonations';
import { StudentHeader } from '@/components/student/StudentHeader';
import { StudentCreativity } from '@/components/student/StudentCreativity';
import { StudentEmpathyTeamwork } from '@/components/student/StudentEmpathyTeamwork';
import { JoinTheFun } from '@/components/student/JoinTheFun';
import { SpreadCreativity } from '@/components/student/SpreadCreativity';
import { Seo } from '@/components/shared/Seo';

const studentMetadata = {
  title: 'Students | ICAF',
  description: 'Bring your ideas to life by joining ICAF’s creative programs.',
  path: '/get-involved/students',
};

export const Student = () => {
  return (
    <>
      <Seo {...studentMetadata} />
      <div className="content-gap">
        <StudentHeader />
        <StudentCreativity />
        <StudentEmpathyTeamwork />
        <JoinTheFun />
        <SpreadCreativity />
        <YourDonations />
      </div>
      <PageBottomSpacer />
    </>
  );
};
