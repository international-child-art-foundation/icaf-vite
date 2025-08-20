import { IActivityItemPair, IActivitySection } from '@/types/HomeActivities';
import { ActivityPair } from './ActivityPair';

interface ActivitiesProps {
  activityPairs: IActivitySection;
}

export const Activities = ({ activityPairs }: ActivitiesProps) => {
  const pickDefaults = (section: IActivitySection) =>
    section.map((pair, i) => pair[i % 2].id);

  const defaults = pickDefaults(activityPairs);
  return (
    <div className="grid gap-6">
      {activityPairs.map((pair: IActivityItemPair, i) => (
        <ActivityPair
          pair={pair}
          key={`${pair[0].id}-${pair[1].id}`}
          defaultExpandedId={defaults[i]}
        />
      ))}
    </div>
  );
};
