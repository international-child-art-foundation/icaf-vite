import { Button } from '@/components/ui/button';
import { HeartIcon } from '@/assets/shared/icons/HeartIcon';
import { CurvedImage } from '@/pages/CurvedImage';
import { useNavigate } from 'react-router-dom';
import { useWindowSize } from 'usehooks-ts';
import artShowcaseHeader from '@/assets/home/ArtShowcaseHeader.webp';

const HomeHeader = () => {
  const navigate = useNavigate();
  const size = useWindowSize();
  const gradientXL =
    'bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.6)_40%,rgba(0,0,0,0.1)_60%,rgba(255,255,255,0.2)_100%)]';
  const gradientLG =
    'bg-[linear-gradient(to_right,rgba(0,0,0,0.75)_0%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.15)_70%,rgba(255,255,255,0.15)_100%)]';
  const gradientMD =
    'bg-gradient-to-r from-black/80 from-0% via-black/40 via-[60%] to-white/20 to-100%';
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
    <div className="grid w-full grid-cols-1 grid-rows-1">
      <div className="font-montserrat z-10 col-start-1 row-start-1 mt-8 flex max-w-screen-2xl flex-col gap-4 p-10 px-8 text-3xl font-extrabold text-white md:mt-20 md:px-12 md:text-4xl lg:mt-28 lg:px-16 lg:text-6xl xl:px-20">
        <div className="block">
          <p>Welcome to ICAF</p>
          <p>Inspiring Creativity,</p>
          <p>Transforming Lives</p>
        </div>
        <p className="font-openSans text-lg font-normal text-white md:max-w-[50%]">
          Empowering the next generation through the arts since 1997.
        </p>
        <Button
          variant="secondary"
          className="h-14 self-start rounded-full px-6 text-base tracking-wide"
          onClick={() => void navigate('/donate')}
        >
          <HeartIcon
            strokeWidth={2}
            className="!h-5 !w-5 stroke-black lg:mr-0 lg:!h-5 lg:!w-5"
          />
          Donate to our campaign
        </Button>
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
