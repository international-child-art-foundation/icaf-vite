import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';
import YourDonations from '@/modules/content/components/shared/YourDonations';
import { StudentHeader } from '@/modules/content/components/student/StudentHeader';
import { StudentCreativity } from '@/modules/content/components/student/StudentCreativity';
import { StudentEmpathyTeamwork } from '@/modules/content/components/student/StudentEmpathyTeamwork';
import { JoinTheFun } from '@/modules/content/components/student/JoinTheFun';
import { SpreadCreativity } from '@/modules/content/components/student/SpreadCreativity';
import { Seo } from '@/modules/content/components/shared/Seo';

const studentMetadata = {
  title: 'Student Opportunities at ICAF — Internships & Arts Programs',
  description:
    "Students can get involved with ICAF through internships, volunteer programs, and arts initiatives that build skills and support children's creativity worldwide.",
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
