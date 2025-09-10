import TeamHeader from '@/components/team/TeamHeader';
import { staffData } from '@/data/team/staffData';
import { TeamStaff } from '@/components/team/TeamStaff';
import { TeamDesignDev } from '@/components/team/TeamDesignDev';
import { Creativity } from '@/components/team/Creativity';

export const Team = () => {
  return (
    <div className="flex flex-col">
      <TeamHeader />
      <div className="flex flex-col gap-16">
        <TeamStaff staffData={staffData} />
        <TeamDesignDev />
        <Creativity />
      </div>
    </div>
  );
};
