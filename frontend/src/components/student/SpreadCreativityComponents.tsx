import creativityImg from '@/assets/student/spreadCreativity.webp';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { HeartIcon } from '@/assets/shared/icons/HeartIcon';

const Title = () => {
  return (
    <h2 className="font-montserrat text-[36px] font-extrabold">
      Help Us Spread Creativity!
    </h2>
  );
};

const Description = () => {
  return (
    <p className="text-left text-base lg:text-xl">
      Want to make a difference? You can help ICAF by organizing a fun event at
      your school. Maybe you can auction your artwork, have a talent show, or
      come up with a creative idea to raise funds. Your support helps us run
      programs like the Arts Olympiad, the World Children's Festival, and
      publish ChildArt magazine. Together, we can inspire creativity in kids
      everywhere!
    </p>
  );
};

const DonateButton = () => {
  return (
    <Link to="/donate" className="mr-0 mt-8 text-right md:mt-0">
      <Button
        variant="secondary"
        className="h-14 self-start rounded-full px-6 text-base tracking-wide"
      >
        <HeartIcon
          strokeWidth={2}
          className="!h-5 !w-5 stroke-black lg:mr-0 lg:!h-5 lg:!w-5"
        />
        Donate to our Campaign
      </Button>
    </Link>
  );
};

const SideImg = () => {
  return (
    <div className="w-unset m-auto min-h-[130px] max-w-[200px] shrink-0 content-center rounded-[21px] md:h-full md:w-[30%] md:max-w-none lg:w-[40%] xl:h-[444px] xl:w-[444px] xl:content-start xl:py-12">
      <img
        src={creativityImg}
        className="xl:h-unset h-full rounded-[21px] object-cover xl:w-full"
      />
    </div>
  );
};

export const CardContentXl = () => {
  return (
    <div className="bg-background col-start-1 row-start-1 ml-32 mt-12 flex flex-row items-center gap-2 rounded-[22px] p-12 align-middle shadow-lg xl:gap-8">
      <SideImg />
      <div className="flex flex-col gap-8 p-4">
        <Title />
        <Description />
        <DonateButton />
      </div>
    </div>
  );
};
export const CardContentMdLg = () => {
  return (
    <div className="bg-background col-start-1 row-start-1 ml-12 mt-12 flex flex-col items-center gap-2 rounded-[22px] p-12 text-center align-middle shadow-lg xl:gap-8">
      <Title />
      <div className="flex flex-row items-center justify-center gap-8 p-4 align-middle">
        <SideImg />
        <Description />
      </div>
      <DonateButton />
    </div>
  );
};
export const CardContentSm = () => {
  return (
    <div className="bg-background col-start-1 row-start-1 ml-6 mt-12 flex flex-col items-center gap-4 rounded-[22px] p-12 align-middle shadow-lg xl:gap-8">
      <SideImg />
      <Title />
      <Description />
      <DonateButton />
    </div>
  );
};
