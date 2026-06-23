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
  title: 'Meet the ICAF Team — The People Behind Our Global Arts Mission',
  description:
    "Get to know the dedicated staff and leadership behind ICAF's global arts education programs, festivals, and initiatives that empower children around the world.",
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
