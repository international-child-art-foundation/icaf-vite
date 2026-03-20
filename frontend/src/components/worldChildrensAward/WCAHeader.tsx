import { CurvedImage } from '@/pages/CurvedImage';
import { wcaHeader } from '@/assets/worldChildrensAward';
import { useWindowSize } from 'usehooks-ts';

export const WCAHeader = () => {
  const size = useWindowSize();
  const gradientXL = 'bg-black/50';
  const gradientLG = 'bg-black/50';
  const gradientMD = 'bg-black/50';
  const gradientSM = 'bg-black/50';

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
    <div className="site-w grid grid-cols-1 grid-rows-1">
      <div className="col-start-1 row-start-1">
        <CurvedImage
          src={wcaHeader}
          gradientDefinition={gradientDefinition}
          objectPosition={'50% 15%'}
        />
      </div>
      <div className="hero-w font-montserrat z-10 col-start-1 row-start-1 mt-24 flex flex-col gap-4 pt-10 text-white md:mt-10 lg:mt-16">
        <h1 className="font-montserrat text-4xl font-extrabold lg:text-[40px] xl:text-6xl">
          <span className="text-[#FBB22E]">World Children's</span>
          <br />
          Award
        </h1>
        <p className="max-w-2xl font-sans text-xl font-normal leading-relaxed">
          A global honor created by children to celebrate leaders making a
          positive impact
        </p>
      </div>
    </div>
  );
};
