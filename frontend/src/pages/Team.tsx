import TeamHeader from '@/components/team/TeamHeader';
import { staffData } from '@/data/team/staffData';
import { TeamStaff } from '@/components/team/TeamStaff';
import { TeamDesignDev } from '@/components/team/TeamDesignDev';

export const Team = () => {
  return (
    <div>
      <TeamHeader />
      <TeamStaff staffData={staffData} />
      <TeamDesignDev />
    </div>
  );
};
