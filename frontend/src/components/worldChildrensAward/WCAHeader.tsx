import { CurvedImage } from '@/pages/CurvedImage';
import headerImg from '@/assets/worldChildrensAward/wca-header.webp';
import { useWindowSize } from 'usehooks-ts';

export const WCAHeader = () => {
  const size = useWindowSize();
  const gradientXL = 'bg-black/60';
  const gradientLG = 'bg-black/60';
  const gradientMD = 'bg-black/60';
  const gradientSM = 'bg-black/60';

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
    <div>
      <div className="grid grid-cols-1 grid-rows-1">
        <div className="col-start-1 row-start-1">
          <CurvedImage
            src={headerImg}
            gradientDefinition={gradientDefinition}
            objectPosition={'50% 15%'}
          />
        </div>
        <div className="font-montserrat z-10 col-start-1 row-start-1 mt-32 flex max-w-screen-2xl flex-col gap-4 p-6 font-extrabold text-white sm:p-10 sm:px-8 md:mt-24 md:px-12 lg:mt-24 lg:max-w-[75%] lg:px-16 xl:mt-20 xl:px-20">
          <div className="font-montserrat block text-4xl font-extrabold leading-[30px] sm:text-[50px] sm:leading-[50px] md:text-[60px] md:leading-[70px]">
            <h1 className="flex flex-col gap-4 sm:gap-0">
              {' '}
              <p className="text-[#FBB22E]">World Children's</p>
              <p>Award</p>
            </h1>
          </div>
          <div>
            <p className="text-[20px] font-normal">
              A global honor created by children to celebrate leaders making a
              positive impact
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
