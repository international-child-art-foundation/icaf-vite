import TeamHeader from '@/modules/content/components/team/TeamHeader';
import { staffData } from '@/modules/content/data/team/staffData';
import { TeamStaff } from '@/modules/content/components/team/TeamStaff';
import { Creativity } from '@/modules/content/components/team/Creativity';
import { ScrollToTop } from '@/modules/content/components/team/ScrollToTop';
import { useRef } from 'react';
import { TeamExtendedStaff } from '../components/team/TeamExtendedStaff';
import { Seo } from '@/modules/content/components/shared/Seo';
import { scrollToSection } from '@/utils/utils';

const teamMetadata = {
  title: 'Team | ICAF',
  description:
    'ICAF’s team is a dedicated group of creatives, educators, and professionals working together to help young artists express their imagination.',
  path: '/about/team',
};

export const Team = () => {
  const HEADER_OFFSET = 110;

  const topRef = useRef<HTMLDivElement | null>(null);

  const handleScrollToStaff = () => scrollToSection(topRef, HEADER_OFFSET);

  return (
    <>
      <Seo {...teamMetadata} />
      <div ref={topRef} className="content-gap">
        <TeamHeader scrollFunction={handleScrollToStaff} />
        <TeamStaff staffData={staffData} />
        <TeamExtendedStaff />
        <Creativity />
        <ScrollToTop targetRef={topRef} flairColor={'primaryBlue'} offset={0} />
      </div>
    </>
  );
};
