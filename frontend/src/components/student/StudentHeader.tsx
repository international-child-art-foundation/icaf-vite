import { CurvedImage } from '@/pages/CurvedImage';
import studentHeaderImg from '@/assets/student/studentHeader.webp';
import { OpinionatedGradients } from '@/data/gradientDefinition';
import { useWindowSize } from 'usehooks-ts';

export const StudentHeader = () => {
  const size = useWindowSize();

  let gradientDefinition;
  if (size.width >= 1280) {
    gradientDefinition = OpinionatedGradients.xl;
  } else if (size.width >= 1024) {
    gradientDefinition =
      'bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.6)_40%,rgba(0,0,0,0.4)_60%,rgba(255,255,255,0.2)_100%)]';
  } else if (size.width >= 640) {
    gradientDefinition = OpinionatedGradients.md;
  } else {
    gradientDefinition = OpinionatedGradients.sm;
  }

  return (
    <div className="site-w grid grid-cols-1 grid-rows-1">
      <div className="col-start-1 row-start-1">
        <CurvedImage
          src={studentHeaderImg}
          gradientDefinition={gradientDefinition}
          height="700px"
          objectPosition="50% 90%"
        />
      </div>
      <div className="hero-w font-montserrat z-10 col-start-1 row-start-1 mt-8 flex flex-col gap-6 pt-6 text-3xl font-extrabold text-white sm:gap-6 sm:pt-10 md:text-4xl lg:text-6xl">
        <div className="font-montserrat block pt-12 text-[32px] font-extrabold leading-[40px] sm:text-[40px] sm:leading-[48px] md:max-w-[80%] lg:text-[60px] lg:leading-[68px] xl:max-w-[70%]">
          <h1>Explore Your Creativity with ICAF!</h1>
        </div>
        <h2 className="font-montserrat text-[24px] font-extrabold leading-[32px] sm:text-[30px] sm:leading-[38px]">
          Discover the Power of Art and Imagination
        </h2>
        <p className="font-openSans text-base font-normal text-white md:max-w-[80%] lg:text-lg xl:max-w-[50%] 2xl:text-xl">
          Welcome to ICAF, where your creativity takes center stage! Art isn't
          just about painting or drawing—it's about imagining new ideas and
          bringing them to life. Imagination fuels creativity, and creativity is
          the key to solving problems, inventing new things, and making the
          world a better place.
        </p>
      </div>
    </div>
  );
};
