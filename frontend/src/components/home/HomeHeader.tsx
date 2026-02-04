import { CurvedImage } from '@/pages/CurvedImage';
import { useWindowSize } from 'usehooks-ts';
import artShowcaseHeader from '@/assets/home/ArtShowcaseHeader.webp';
import DonateButton from '../ui/donateButton';

const HomeHeader = () => {
  const size = useWindowSize();
  const gradientXL =
    'bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.6)_40%,rgba(0,0,0,0.1)_60%,rgba(255,255,255,0.2)_100%)]';
  const gradientLG =
    'bg-[linear-gradient(to_right,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.15)_70%,rgba(255,255,255,0.15)_100%)]';
  const gradientMD =
    'bg-gradient-to-r from-black/80 from-0% via-black/40 via-[60%] to-white/20 to-100%';
  const gradientSM =
    'bg-gradient-to-b from-black/70 through/black/60 to-black/70';

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
      <div className="font-montserrat max-w-screen-3xl z-10 col-start-1 row-start-1 mt-8 flex flex-col gap-4 p-10 px-8 text-3xl font-extrabold text-white md:mt-20 md:px-12 md:text-4xl lg:mt-28 lg:px-16 lg:text-6xl xl:px-20">
        <div className="block">
          <h2>Welcome to ICAF</h2>
          <h2 className="text-tertiary-yellow [text-shadow:1px_1px_5px_rgba(0,0,0,0.5)]">
            Inspiring Creativity,
          </h2>
          <h2 className="text-tertiary-yellow [text-shadow:1px_1px_5px_rgba(0,0,0,0.5)]">
            Transforming Lives
          </h2>
        </div>
        <h3 className="font-openSans text-lg font-normal text-white md:max-w-[50%]">
          Empowering the next generation through the arts since 1997.
        </h3>
        <div className="max-w-[300px]">
          <DonateButton text="Donate to our Campaign" />
        </div>
      </div>
      <div className="col-start-1 row-start-1">
        <CurvedImage
          gradientDefinition={gradientDefinition}
          src={artShowcaseHeader}
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

export default HomeHeader;
