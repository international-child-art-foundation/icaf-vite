import TeamHeader from '@/components/team/TeamHeader';
import { staffData } from '@/data/team/staffData';
import { TeamStaff } from '@/components/team/TeamStaff';
import { Creativity } from '@/components/team/Creativity';
import { ScrollToTop } from '@/components/team/ScrollToTop';
import { useRef } from 'react';
import { TeamExtendedStaff } from '../components/team/TeamExtendedStaff';
import { Seo } from '@/components/shared/Seo';
import { scrollToSection } from '@/lib/utils';

const teamMetadata = {
  title: 'Team | ICAF',
  description:
    'ICAF’s team is a dedicated group of creatives, educators, and professionals working together to help young artists express their imagination.',
  path: '/about/team',
};

export const Team = () => {
  const HEADER_OFFSET = 110;

  const topRef = useRef<HTMLDivElement | null>(null);
  const staffRef = useRef<HTMLDivElement | null>(null);

  const handleScrollToStaff = () => scrollToSection(staffRef, HEADER_OFFSET);

  return (
    <>
      <Seo {...teamMetadata} />
      <div ref={topRef} className="flex flex-col">
        <TeamHeader scrollFunction={handleScrollToStaff} />
        <div
          ref={staffRef}
          className="flex max-w-screen-2xl flex-col gap-16 px-8 md:px-12 lg:px-16 xl:px-20"
        >
          <TeamStaff staffData={staffData} />
          <TeamExtendedStaff />
          <Creativity />
          <ScrollToTop
            targetRef={topRef}
            flairColor={'primaryBlue'}
            offset={0}
          />
        </div>
      </div>
    </>
  );
};
