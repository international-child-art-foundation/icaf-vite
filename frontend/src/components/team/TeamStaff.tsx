import { TStaffData } from '@/types/TeamPageTypes';
import { TeamStaffItem } from './TeamStaffItem';

interface TeamStaffProps {
  staffData: TStaffData;
}

export const TeamStaff = ({ staffData }: TeamStaffProps) => {
  return (
    <div className="flex flex-col gap-10">
      <div className="text-center">
        <p className="font-montserrat text-[40px] font-extrabold">ICAF Staff</p>
        <p className="font-sans text-2xl">
          Providing vision and expertise to drive ICAF’s mission forward.
        </p>
      </div>

      <div className="mx-auto flex max-w-full flex-wrap justify-center gap-12 overflow-hidden">
        {' '}
        {staffData.map((staffItem) => (
          <TeamStaffItem key={staffItem.name} data={staffItem} />
        ))}
      </div>
    </div>
  );
};
