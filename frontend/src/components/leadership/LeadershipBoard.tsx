import { boardMembers } from '@/data/leadership/BoardMembers';
import { BoardMembers } from './BoardMembers';

export const LeadershipBoard = () => {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <div className="flex flex-col items-center gap-2">
        <h2 className="font-montserrat text-3xl font-extrabold lg:text-[40px]">
          Board Members
        </h2>
        <p className="max-w-[600px] text-[24px] leading-7">
          United by a simple belief: investing in childhood is the most powerful
          way to shape a better world.{' '}
        </p>
      </div>

      <BoardMembers memberData={boardMembers} />
    </div>
  );
};
