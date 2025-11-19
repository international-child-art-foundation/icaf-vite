import { ArtsOlympiadHeader } from '@/components/artsOlympiad/ArtsOlympiadHeader';
import { ArtsOlympiadGuidelines } from '@/components/artsOlympiad/ArtsOlympiadGuidelines';
import { ArtsOlympiadCTA } from '@/components/artsOlympiad/ArtsOlympiadCTA';
import { ArtsOlympiadCards } from '@/components/artsOlympiad/ArtsOlympiadCards';
import { ArtsOlympiadVision } from '@/components/artsOlympiad/ArtsOlympiadVision';

export const ArtsOlympiad = () => {
  return (
    <div>
      <div>
        <ArtsOlympiadHeader />
        <div className="flex max-w-screen-2xl flex-col gap-8 px-8 md:px-12 lg:gap-12 lg:px-16 xl:px-20">
          <ArtsOlympiadVision />
          <ArtsOlympiadGuidelines />
          <ArtsOlympiadCards />
          <ArtsOlympiadCTA />
        </div>
      </div>
    </div>
  );
};
