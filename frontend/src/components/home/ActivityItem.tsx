import { IActivityItem } from '@/types/HomeActivities';
import { CircleArrowUp, CircleArrowDown } from 'lucide-react';

interface ActivityItemProps {
  item: IActivityItem;
  expanded: boolean;
  toggle: React.Dispatch<React.SetStateAction<number>>;
}

export const ActivityItem = ({ item, expanded, toggle }: ActivityItemProps) => {
  return (
    <div
      className={`grid cursor-pointer grid-cols-1 grid-rows-1 overflow-hidden rounded-[40px]`}
      onMouseEnter={() => toggle(item.id)}
    >
      <div className="relative z-10 col-start-1 row-start-1 my-auto h-full p-4 text-white">
        <div className="grid-col grid h-full place-content-center place-items-center items-center gap-4">
          <p className="font-montserrat text-center text-2xl font-semibold">
            {item.title}
          </p>
          <p
            className={`font-open-sans duration-400 grid transition-all ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'} text-base md:text-xl`}
          >
            <span className="overflow-hidden">{item.description}</span>
          </p>
        </div>
        <div className="absolute bottom-6 left-0 right-0 flex justify-center">
          {expanded ? (
            <CircleArrowUp className={'h-6 w-6'} />
          ) : (
            <CircleArrowDown className={'h-6 w-6'} />
          )}
        </div>
      </div>
      <img
        className="col-start-1 row-start-1 h-full w-full object-cover"
        src={item.img}
      />
    </div>
  );
};
