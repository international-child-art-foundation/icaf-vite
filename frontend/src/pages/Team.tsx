import TeamHeader from '@/components/team/TeamHeader';
import { staffData } from '@/data/team/staffData';
import { TeamStaff } from '@/components/team/TeamStaff';
import { TeamDesignDev } from '@/components/team/TeamDesignDev';
import { Creativity } from '@/components/team/Creativity';
import { ScrollToTop } from '@/components/team/ScrollToTop';
import { useRef } from 'react';

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
    <div className="flex flex-col">
      <TeamHeader scrollFunction={scrollToSection} />
      <div ref={staffRef} className="flex flex-col gap-16">
        <TeamStaff staffData={staffData} />
        <TeamDesignDev />
        <Creativity />
        <ScrollToTop scrollFunction={scrollToSection} />
      </div>
    </div>
  );
};
