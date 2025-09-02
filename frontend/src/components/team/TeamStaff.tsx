import { TStaffData } from '@/types/TeamPageTypes';
import { TeamStaffItem } from './TeamStaffItem';

interface TeamStaffProps {
  staffData: TStaffData;
}

export const TeamStaff = ({ staffData }: TeamStaffProps) => {
  return (
    <div>
      <div className="grid-col grid gap-4">
        {staffData.map((staffItem) => (
          <TeamStaffItem key={staffItem.name} data={staffItem} />
        ))}
      </div>
    </div>
  );
};
