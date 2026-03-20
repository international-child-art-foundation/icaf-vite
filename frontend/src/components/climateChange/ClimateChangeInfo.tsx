import { linkClasses } from '@/data/linkClasses';

import { muralBahrain, muralNigeria, muralUSA, muralPeru, muralAustria } from '@/assets/climateChange';
import { MuralCard } from './MuralCard';

export const ClimateChangeInfo = () => {
  return (
    <div className="content-w m-pad flex flex-col gap-8">
      <h2 className="font-montserrat text-3xl font-semibold">
        Why care about climate change?
      </h2>

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
            ,which begins with{' '}
            <a
              href="https://worldchildrensfestival.org/health-and-environment-day"
              className={linkClasses}
              target="_blank"
              rel="noopener noreferrer"
            >
              Health & Environment Day
            </a>
            , young artists learn about our changing planet, find their voices,
            and discover that their creativity can inspire action: within their
            families, classrooms, and entire communities.
          </p>
        </div>

        <div className="grid gap-4 lg:hidden">
          <MuralCard src={muralBahrain} name="Islam Hasan" age={10} />
          <MuralCard src={muralNigeria} name="Judith Yahaya" age={12} />
        </div>

        <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid grid-cols-2 grid-rows-2 gap-4">
            <MuralCard src={muralBahrain} name="Islam Hasan" age={10} />
            <MuralCard src={muralNigeria} name="Judith Yahaya" age={12} />
            <MuralCard src={muralUSA} name="Alina Ponomarenko" age={11} />
            <MuralCard src={muralPeru} name="Carla Guadalupe" age={8} />
          </div>

          <MuralCard
            src={muralAustria}
            name="Samara Claudia Bittermann"
            age={10}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
};
