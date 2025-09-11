import heroImage from '@/assets/worldChildrensFestival/dancingGirl.webp';
import { CurvedImage } from '@/pages/CurvedImage';
import { useWindowSize } from 'usehooks-ts';
import { Button } from '../ui/button';

//notes:  Used the same gradient as on homepage.  Check the p text size
/**
 * This component is the header/hero for the programs/world children's festival page.
 * Includes a gradient across the image, text, and a button that opens a new page for https://worldchildrensfestival.org/why.
 */
export default function WCFHeader() {
  const size = useWindowSize();
  const gradientXL =
    'bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.6)_40%,rgba(0,0,0,0.1)_60%,rgba(255,255,255,0.2)_100%)]';
  const gradientLG =
    'bg-[linear-gradient(to_right,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.15)_70%,rgba(255,255,255,0.15)_100%)]';
  const gradientMD =
    'bg-gradient-to-r from-black/80 from-0% via-black/40 via-[60%] to-white/20 to-100%';
  const gradientSM = 'bg-black/50';

  const heightMD = '700px';
  const heightSM = '800px';

  let gradientDefinition;
  let height;
  if (size.width >= 1280) {
    gradientDefinition = gradientXL;
    height = heightMD;
  } else if (size.width >= 1024) {
    height = heightMD;
    gradientDefinition = gradientLG;
  } else if (size.width >= 640) {
    gradientDefinition = gradientMD;
    height = heightMD;
  } else {
    gradientDefinition = gradientSM;
    height = heightSM;
  }

  return (
    <div>
      <figure className="relative">
        <CurvedImage
          src={heroImage}
          objectPosition="right "
          gradientDefinition={gradientDefinition}
          height={height}
        />
        <figcaption className="sr-only">
          World Children's Festival hero image
        </figcaption>
        <div className="absolute inset-0 top-8 mx-4 w-[85%] text-white sm:w-[70%] md:top-10 lg:top-16 lg:w-[65%] xl:mx-8">
          <h1 className="font-montserrat text-3xl font-extrabold lg:text-[40px] xl:text-[60px]">
            World Children's Festival
          </h1>
          <h3 className="my-2 font-bold md:my-4 lg:text-2xl xl:my-0 xl:mb-6 xl:mt-10">
            The "Olympics" of Children's Imagination
          </h3>
          <p className="mb-2 text-base font-normal md:mb-4 md:text-xl xl:mb-6">
            Every four years, the World Children's Festival (WCF) turns the
            National Mall across from the U.S Capitol inoto a global stage for a
            three-day celebration of creativity, diversity, and unity. More than
            a festival, it's a movement—empowering children through art,
            education, and collaboration
          </p>
          <p className="mb-2 text-base font-normal md:mb-4 md:text-xl xl:mb-6">
            At WCF, kids don't just create—they lead. They become
            "creative-empaths," using imagination and empathy to shape a better
            world.{' '}
          </p>
          <p className="mb-4 text-base font-normal md:mb-6 md:text-xl xl:mb-6">
            The 7th WCF is coming in June 2026. Will you be there?
          </p>
          <a
            href="https://worldchildrensfestival.org/"
            target="blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="secondary"
              className="h-14 w-[225px] rounded-full text-base font-semibold 2xl:w-[270px]"
            >
              Join the Movement
            </Button>
          </a>
        </div>
      </figure>
    </div>
  );
}
