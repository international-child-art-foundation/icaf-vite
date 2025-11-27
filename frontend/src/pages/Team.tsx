import TeamHeader from '@/components/team/TeamHeader';
import { staffData } from '@/data/team/staffData';
import { TeamStaff } from '@/components/team/TeamStaff';
import { Creativity } from '@/components/team/Creativity';
import { ScrollToTop } from '@/components/team/ScrollToTop';
import { useRef } from 'react';
import { TeamExtendedStaff } from '../components/team/TeamExtendedStaff';
import { Seo } from '@/components/shared/Seo';

const teamMetadata = {
  title: 'Team | ICAF',
  description:
    'ICAF’s team is a dedicated group of creatives, educators, and professionals working together to help young artists express their imagination.',
  path: '/about/team',
};

export const Team = () => {
  const HEADER_OFFSET = 110;

  const staffRef = useRef<HTMLDivElement | null>(null);

  const scrollToSection = () => {
    if (staffRef.current) {
      const y =
        staffRef.current.getBoundingClientRect().top +
        window.scrollY -
        HEADER_OFFSET;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <>
      <Seo {...teamMetadata} />
      <div className="flex flex-col">
        <TeamHeader scrollFunction={scrollToSection} />
        <div
          ref={staffRef}
          className="flex max-w-screen-2xl flex-col gap-16 px-8 md:px-12 lg:px-16 xl:px-20"
        >
          <TeamStaff staffData={staffData} />
          <TeamExtendedStaff />
          <Creativity />
          <ScrollToTop
            scrollFunction={scrollToSection}
            flairColor={'primaryBlue'}
          />
        </div>
      </div>
    </>
  );
};
