import { CurvedImage } from '@/pages/CurvedImage';
import { OpinionatedGradients } from '@/data/gradientDefinition';
import ClimateChangeHeaderImg from '@/assets/climateChange/climateChangeHeader.webp';

import { useWindowSize } from 'usehooks-ts';

export const ClimateChangeHeader = () => {
  const size = useWindowSize();
  let gradientDefinition;
  if (size.width >= 1280) {
    gradientDefinition =
      'bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.6)_40%,rgba(0,0,0,0.4)_60%,rgba(0,0,0,0)_100%)]';
  } else if (size.width >= 1024) {
    gradientDefinition = OpinionatedGradients.lg;
  } else if (size.width >= 640) {
    gradientDefinition = OpinionatedGradients.sm;
  } else {
    gradientDefinition = OpinionatedGradients.sm;
  }

  return (
    <div className="grid w-full grid-cols-1 grid-rows-1">
      <div className="font-montserrat z-10 col-start-1 row-start-1 mt-24 flex max-w-screen-2xl flex-col gap-2 p-6 text-3xl font-extrabold text-white sm:gap-4 sm:p-10 sm:px-8 md:mt-8 md:px-12 md:text-4xl lg:mt-20 lg:px-16 lg:text-6xl xl:px-20">
        <div className="font-montserrat block text-[30px] font-extrabold leading-[40px] sm:text-[40px] sm:leading-[50px] md:text-[60px] md:leading-[70px] lg:max-w-[60%]">
          <p>Climate Change</p>
        </div>
        <p className="font-openSans text-xl font-normal text-white lg:max-w-[50%] xl:max-w-[50%]">
          Today, young people all over the world are at the forefront of
          environmental protection, concerned that this little blue planet is
          facing irreversible climate change.
        </p>
        <p className="font-openSans text-xl font-normal text-white lg:max-w-[50%] xl:max-w-[50%]">
          The future belongs to the children. They alone have the power to shape
          a tomorrow in which green spaces, clean air, and clear water are
          plentiful.
        </p>
      </div>
      <div className="col-start-1 row-start-1">
        <CurvedImage
          gradientDefinition={gradientDefinition}
          src={ClimateChangeHeaderImg}
          height={'700px'}
          objectFit="cover"
          scale={1}
          objectPosition="top right"
        />
      </div>
    </div>
  );
};
