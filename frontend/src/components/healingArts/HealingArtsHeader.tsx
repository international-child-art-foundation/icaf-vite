import { CurvedImage } from '@/pages/CurvedImage';
import { useWindowSize } from 'usehooks-ts';
import healingArtsHeader from '@/assets/healingArts/healing-arts-header.webp';

export const HealingArtsHeader = () => {
  const size = useWindowSize();
  const gradientXL =
    'bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.6)_40%,rgba(0,0,0,0.1)_60%,rgba(255,255,255,0.2)_100%)]';
  const gradientLG =
    'bg-[linear-gradient(to_right,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.15)_70%,rgba(255,255,255,0.15)_100%)]';
  const gradientMD =
    'bg-gradient-to-r from-black/80 from-0% via-black/40 via-[60%] to-white/20 to-100%';
  const gradientSM = 'bg-black/70';

  let gradientDefinition;
  if (size.width >= 1280) {
    gradientDefinition = gradientXL;
  } else if (size.width >= 1024) {
    gradientDefinition = gradientLG;
  } else if (size.width >= 640) {
    gradientDefinition = gradientMD;
  } else {
    gradientDefinition = gradientSM;
  }

  return (
    <div className="grid w-full grid-cols-1 grid-rows-1">
      <div className="font-montserrat z-10 col-start-1 row-start-1 flex max-w-screen-2xl flex-col gap-2 p-6 text-3xl font-extrabold text-white sm:gap-4 sm:p-10 sm:px-8 md:mt-8 md:px-12 md:text-4xl lg:mt-28 lg:px-16 lg:text-6xl xl:px-20">
        <div className="font-montserrat block text-[30px] font-extrabold leading-[40px] sm:text-[40px] sm:leading-[50px] md:text-[60px] md:leading-[70px]">
          <p>Healing Arts Programs:</p>
          <p className="text-tertiary-yellow">Empowering Child Survivors</p>
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
