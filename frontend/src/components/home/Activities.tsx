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
    <div className="grid gap-2">
      <div className="grid w-full max-w-screen-2xl auto-rows-auto grid-cols-2 gap-6 px-8 md:px-12 lg:grid-cols-4 lg:px-16 xl:px-20">
        {' '}
        {activityPairs.map((pair: IActivityItemPair, i) => (
          <ActivityPair
            pair={pair}
            key={`${pair[0].id}-${pair[1].id}`}
            defaultExpandedId={defaults[i]}
          />
        ))}
      </div>
      <p className="max-w-screen-2xl px-8 md:px-12 lg:px-16 xl:px-20">
        *The mark “Arts Olympiad” is used under license from the U.S. Olympic
        and Paralympic Committee.
      </p>
    </div>
  );
};
