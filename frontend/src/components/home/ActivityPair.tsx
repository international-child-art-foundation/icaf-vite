import { IActivityItemPair, IActivityItem } from '@/types/HomeActivities';
import { ActivityItem } from './ActivityItem';
import { useState } from 'react';

interface ActivityPairProps {
  pair: IActivityItemPair;
  defaultExpandedId: number;
}

export const ActivityPair = ({
  pair,
  defaultExpandedId,
}: ActivityPairProps) => {
  const [expandedId, setExpandedId] = useState<number>(defaultExpandedId);

  return (
    <div
      className={`grid h-[500px] max-h-full grid-cols-1 gap-6 overflow-hidden lg:h-[600px] ${expandedId === pair[0].id ? '[grid-template-rows:3fr_2fr]' : '[grid-template-rows:2fr_3fr]'} duration-400 transition-[grid-template-rows] ease-in-out`}
    >
      {pair.map((item: IActivityItem) => (
        <ActivityItem
          key={item.title}
          item={item}
          expanded={expandedId === item.id}
          toggle={() => setExpandedId(item.id)}
        />
      ))}
    </div>
  );
};
