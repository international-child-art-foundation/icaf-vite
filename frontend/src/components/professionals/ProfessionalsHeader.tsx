import { CurvedImage } from '@/pages/CurvedImage';
import { OpinionatedGradients } from '@/data/gradientDefinition';
import professionalsHeaderImg from '@/assets/professionals/professionals.webp';

import { useWindowSize } from 'usehooks-ts';

export const ProfessionalsHeader = () => {
  const size = useWindowSize();
  let gradientDefinition;
  if (size.width >= 1280) {
    gradientDefinition = OpinionatedGradients.xl;
  } else if (size.width >= 1024) {
    gradientDefinition = OpinionatedGradients.lg;
  } else if (size.width >= 640) {
    gradientDefinition =
      'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.5)_100%)]';
  } else {
    gradientDefinition =
      'bg-[linear-gradient(to_bottom,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.5)_100%)]';
  }

  return (
    <div className="grid w-full grid-cols-1 grid-rows-1">
      <div className="font-montserrat sm:mt-none max-w-screen-3xl z-10 col-start-1 row-start-1 mt-32 flex flex-col gap-2 p-6 text-3xl font-extrabold text-white sm:gap-4 sm:p-10 sm:px-8 md:mt-8 md:px-12 md:text-4xl lg:mt-28 lg:px-16 lg:text-6xl xl:px-20">
        <div className="font-montserrat block text-[30px] font-extrabold leading-[40px] sm:text-[40px] sm:leading-[50px] md:text-[60px] md:leading-[70px]">
          <h1>Professionals</h1>
        </div>
        <p className="font-openSans text-2xl font-normal text-white lg:max-w-[50%] xl:max-w-[38%]">
          Join the children’s movement to democratize creativity and spread
          empathy universally.{' '}
        </p>
      </div>
      <div className="col-start-1 row-start-1">
        <CurvedImage
          gradientDefinition={gradientDefinition}
          src={professionalsHeaderImg}
          height={'600px'}
          objectFit="cover"
          objectPosition="center right"
        />
      </div>
    </div>
  );
};
