import { CurvedImage } from '@/pages/CurvedImage';
import { useWindowSize } from 'usehooks-ts';
import healingArtsHeader from '@/assets/healingArts/healing-arts-header.webp';
import { OpinionatedGradients } from '@/data/gradientDefinition';

export const HealingArtsHeader = () => {
  const size = useWindowSize();

  let gradientDefinition;
  if (size.width >= 1280) {
    gradientDefinition = OpinionatedGradients.xl;
  } else if (size.width >= 1024) {
    gradientDefinition = OpinionatedGradients.lg;
  } else if (size.width >= 640) {
    gradientDefinition = OpinionatedGradients.md;
  } else {
    gradientDefinition = OpinionatedGradients.sm;
  }

  return (
    <div className="grid w-full grid-cols-1 grid-rows-1">
      <div className="font-montserrat z-10 col-start-1 row-start-1 flex max-w-screen-2xl flex-col gap-2 p-6 text-3xl font-extrabold text-white sm:gap-4 sm:p-10 sm:px-8 md:mt-8 md:px-12 md:text-4xl lg:mt-28 lg:px-16 lg:text-6xl xl:px-20">
        <div className="font-montserrat block text-[30px] font-extrabold leading-[40px] sm:text-[40px] sm:leading-[50px] md:text-[60px] md:leading-[70px]">
          <h1>Healing Arts Programs:</h1>
          <h2 className="text-tertiary-yellow">Empowering Child Survivors</h2>
        </div>
        <p className="font-openSans text-lg font-normal text-white lg:max-w-[50%]">
          When natural disasters strike, children often suffer in silence. Our
          Healing Arts Programs use art and community rebuilding to help them
          heal, regain resilience, and restore their trust in nature, bringing
          back hope to affected communities.
        </p>
      </div>
      <div className="col-start-1 row-start-1">
        <CurvedImage
          gradientDefinition={gradientDefinition}
          src={healingArtsHeader}
          height={`${
            size.width >= 1024 ? '700px' : size.width >= 768 ? '640px' : '500px'
          }`}
          objectFit="cover"
          objectPosition="center bottom"
        />
      </div>
    </div>
  );
};
