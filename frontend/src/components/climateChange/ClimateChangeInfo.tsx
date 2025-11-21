import { linkClasses } from '@/data/linkClasses';

import muralOne from '@/assets/climateChange/AO2 Bahrain. Islam Hasan (10 Bahrain).webp';
import muralTwo from '@/assets/climateChange/AO4 Nigeria. Judith Yahaya 12.webp';
import muralThree from '@/assets/climateChange/AO5 USA. Alina Ponomarenko 11. “The Camping Site”.webp';
import muralFour from '@/assets/climateChange/Peru (Carla Guadalupe Gonzalez De La Cruz, 8).webp';
import muralFive from '@/assets/climateChange/Austria (Samara Claudia Bittermann, 10).webp';
import { MuralCard } from './MuralCard';

export const ClimateChangeInfo = () => {
  return (
    <div className="flex flex-col gap-8">
      <p className="font-montserrat text-3xl font-semibold">
        Why care about climate change?
      </p>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 text-lg">
          <p>
            Our climate is the backdrop of every story our children will live
            and draw.
          </p>
          <p>
            Their art reminds us that protecting the planet is about protecting
            their chance to imagine a bright, colorful future. It turns the
            problem of climate change into a shared challenge that calls us to
            respond.
          </p>
          <p>
            Through programs like the{' '}
            <a
              className={linkClasses}
              href="https://worldchildrensfestival.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              World Children's Festival
            </a>{' '}
            which opens with{' '}
            <a
              href="https://worldchildrensfestival.org/health-and-environment-day"
              className={linkClasses}
              target="_blank"
              rel="noopener noreferrer"
            >
              Health & Environment Day
            </a>
            , young artists learn about our changing planet, find their voice,
            and see that their creativity can inspire action, from families and
            classrooms to entire communities.
          </p>
        </div>

        <div className="grid gap-4 lg:hidden">
          <MuralCard src={muralOne} name="Islam Hasan" age={10} />
          <MuralCard src={muralTwo} name="Judith Yahaya" age={12} />
        </div>

        <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            <MuralCard src={muralOne} name="Islam Hasan" age={10} />
            <MuralCard src={muralTwo} name="Judith Yahaya" age={12} />
            <MuralCard src={muralThree} name="Alina Ponomarenko" age={11} />
            <MuralCard src={muralFour} name="Carla Guadalupe" age={8} />
          </div>

          <MuralCard
            src={muralFive}
            name="Samara Claudia Bittermann"
            age={10}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
};
