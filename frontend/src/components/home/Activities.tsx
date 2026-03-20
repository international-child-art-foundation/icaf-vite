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
    <div className="m-pad breakout-w">
      <div className="grid gap-2">
        <div className="grid w-full auto-rows-auto grid-cols-2 gap-2 sm:gap-6 lg:grid-cols-4">
          {' '}
          {activityPairs.map((pair: IActivityItemPair, i) => (
            <ActivityPair
              pair={pair}
              key={`${pair[0].id}-${pair[1].id}`}
              defaultExpandedId={defaults[i]}
            />
          ))}
        </div>
        <p className="breakout-w">
          *The mark “Arts Olympiad” is used under license from the U.S. Olympic
          and Paralympic Committee.
        </p>
      </div>
    </div>
  );
};
