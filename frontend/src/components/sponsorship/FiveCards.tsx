import {
  healthSponsorCard,
  educationSponsorCard,
  genderEqualitySponsorCard,
  peaceSponsorCard,
  inequitiesSponsorCard,
} from '@/data/sponsorship/sponsorCards';
import { GoalCard } from './GoalCard';

export const FiveCards = () => {
  return (
    <div className="grid grid-cols-1 grid-rows-2 gap-8">
      <div className="mx-auto flex w-full flex-row items-center justify-center gap-5">
        <GoalCard {...healthSponsorCard} />
        <GoalCard {...educationSponsorCard} />
        <GoalCard {...genderEqualitySponsorCard} />
      </div>
      <div className="mx-auto flex w-full flex-row items-center justify-center gap-5">
        <GoalCard {...peaceSponsorCard} />
        <GoalCard {...inequitiesSponsorCard} />
      </div>
    </div>
  );
};
