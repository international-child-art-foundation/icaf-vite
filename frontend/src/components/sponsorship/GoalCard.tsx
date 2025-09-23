import { ISponsorCard } from '@/types/SponsorshipTypes';
import { FlairColorMap } from '../shared/FlairColorMap';

export const GoalCard = ({ color, text, Icon }: ISponsorCard) => {
  return (
    <div
      className={`bg-background relative h-[230px] basis-1/3 rounded-[15px] border-4 ${FlairColorMap[color].border} flex flex-col items-center justify-center overflow-hidden p-4`}
    >
      <Icon colorClass={`${FlairColorMap[color].icon} scale-[0.8]`} />
      <p className="text-wrap text-center font-semibold">{text}</p>
    </div>
  );
};
