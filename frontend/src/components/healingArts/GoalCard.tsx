import { IGoalCard } from '@/types/HealingArtsTypes';
import { FlairColorMap } from '../shared/FlairColorMap';

export const GoalCard = ({ Icon, color, title, description }: IGoalCard) => {
  return (
    <div
      className={`relative h-full w-full cursor-pointer ${FlairColorMap[color].backgroundHover} bg-opacity-10 transition-all duration-300`}
    >
      <div
        className={`flex h-full w-full flex-col justify-around gap-2 rounded-[20px] border-[5px] p-4 py-8 text-left lg:p-8 ${FlairColorMap[color].border}`}
      >
        <Icon colorClass={FlairColorMap[color].icon} className={'h-12 w-12'} />
        <p className="font-montserrat text-2xl font-bold">{title}</p>
        <p className="font-sans text-xl">{description}</p>
      </div>
    </div>
  );
};
