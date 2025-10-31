import { TeamCard } from '@/components/team/TeamCard';
import { TeamCardData } from '@/data/team/extendedStaffData';

export const TeamExtendedStaff = () => {
  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-montserrat text-center text-[40px] font-extrabold leading-[48px]">
        ICAF Team
      </h1>
      <div className="grid grid-cols-1 grid-rows-3 gap-[34px] xl:grid-cols-3 xl:grid-rows-1">
        {TeamCardData.map((card) => (
          <TeamCard
            key={card.title}
            title={card.title}
            color={card.color}
            Icon={card.Icon}
            subtitle={card.subtitle}
            groupsOfMembers={card.groupsOfMembers}
          />
        ))}
      </div>
    </div>
  );
};
