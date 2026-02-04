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
    'bg-gradient-to-r from-black/80 from-0% via-black/40 via-[60%] to-black/30 to-100%';
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
        <div className="font-montserrat max-w-screen-3xl z-10 col-start-1 row-start-1 mt-20 flex flex-col gap-10 p-6 text-3xl font-extrabold text-white sm:p-10 sm:px-8 md:px-12 md:text-4xl lg:mt-4 lg:max-w-[55%] lg:px-16 lg:text-6xl xl:mt-12 xl:px-20">
          <div className="font-montserrat block text-4xl font-extrabold sm:text-[50px] sm:leading-[50px] md:text-[60px] md:leading-[70px]">
            <h1>Peace Through Art</h1>
          </div>
          <div>
            <p className="font-openSans text-xl font-bold text-white md:text-[30px] md:leading-[38px]">
              "If we are to reach real peace in this world… we shall have to
              begin with children."
            </p>
            <p className="text-right text-xl italic">- Mahatma Gandhi </p>
          </div>
        </div>
      </div>
    </div>
  );
};
