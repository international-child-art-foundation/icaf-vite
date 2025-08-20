import { IActivityItem } from '@/types/HomeActivities';

interface ActivityItemProps {
  item: IActivityItem;
  expanded: boolean;
  toggle: React.Dispatch<React.SetStateAction<number>>;
}

export const ActivityItem = ({ item, expanded, toggle }: ActivityItemProps) => {
  return (
    <div
      className={`grid grid-cols-1 grid-rows-1 ${expanded ? 'border-8 border-black' : 'border border-white'}`}
      onClick={() => toggle(item.id)}
    >
      <div className="z-10 col-start-1 row-start-1 flex flex-col text-white">
        <p>{item.title}</p>
        <p>{item.description}</p>
      </div>
      <img
        className="col-start-1 row-start-1 h-full w-full object-cover"
        src={item.img}
      />
    </div>
  );
};
