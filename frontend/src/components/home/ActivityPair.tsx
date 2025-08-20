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
    <div>
      {pair.map((item: IActivityItem) => (
        <ActivityItem
          item={item}
          expanded={expandedId == item.id}
          key={item.title}
          toggle={() => setExpandedId(item.id)}
        />
      ))}
    </div>
  );
};
