import ClimateFestivalImg from '@/assets/climateChange/0051424-R6-049-23.webp';
import { Button } from '../ui/button';

const sectionTitleClasses = 'font-montserrat text-3xl font-semibold';
const rightImageWrapperClasses = 'overflow-hidden rounded-xl';
const rightImageClasses = 'h-64 w-full object-cover sm:h-72 lg:h-80';

export const HealthAndEnvironmentDay = () => {
  return (
    <div>
      <div className="flex flex-col gap-8">
        <h2 className={sectionTitleClasses}>
          A Festival for Creativity, Empathy, and Unity
        </h2>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-center">
          <div className="flex h-full flex-col lg:pr-8">
            <div className="flex flex-1 flex-col justify-center gap-4 text-lg">
              <p>
                Every four years at the World Children's Festival, ICAF hosts
                Health & Environment Day to spark collaboration on beautiful
                murals that foster our shared sense of connection.
              </p>
              <p>
                Children from all around the world can come leave their unique
                mark on our shared culture, expressing emotions and ideas that
                cannot be put into words.
              </p>
            </div>

            <div className="mt-6 flex-none text-lg">
              <a
                href="https://worldchildrensfestival.org"
                className="block text-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="px-6 text-lg">
                  Visit the Festival Website
                </Button>
              </a>
            </div>
          </div>

          <div className={rightImageWrapperClasses}>
            <img
              src={ClimateFestivalImg}
              className={rightImageClasses}
              alt="Children collaborating on a mural at the World Children's Festival"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
