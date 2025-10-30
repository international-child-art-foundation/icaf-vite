import { CurvedImage } from '@/pages/CurvedImage';
import peopleImg from '@/assets/peaceThroughArt/group-of-people.webp';
import { useWindowSize } from 'usehooks-ts';

export const PTAHeader = () => {
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
    <div>
      <div className="grid grid-cols-1 grid-rows-1">
        <div className="col-start-1 row-start-1">
          <CurvedImage
            src={peopleImg}
            gradientDefinition={gradientDefinition}
          />
        </div>
        <div className="font-montserrat z-10 col-start-1 row-start-1 mt-20 flex max-w-screen-2xl flex-col gap-10 p-6 text-3xl font-extrabold text-white sm:p-10 sm:px-8 md:px-12 md:text-4xl lg:px-16 lg:text-6xl xl:px-20">
          <div className="font-montserrat block text-[30px] font-extrabold leading-[40px] sm:text-[50px] sm:leading-[50px] md:text-[60px] md:leading-[70px]">
            <p>Peace Through Art</p>
          </div>
          <p className="font-openSans text-xl font-extrabold text-white md:text-[30px] md:leading-[38px] lg:max-w-[50%]">
            "If we are to reach real peace in this world… we shall have to begin
            with children." - Mahatma Gandhi{' '}
          </p>
        </div>
      </div>
    </div>
  );
};
