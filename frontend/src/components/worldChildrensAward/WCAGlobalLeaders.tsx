import ribbonBackground from '@/assets/worldChildrensAward/ribbon-background.svg';
import ribbonFlair from '@/assets/worldChildrensAward/ribbon-flair.svg';
import { WCAGlobalLeadersData } from '@/data/worldChildrensAward/WCAData';
import { ImgShowcase } from './ImgShowcase';
import { linkClasses } from '@/data/linkClasses';

export const WCAGlobalLeaders = () => {
  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-montserrat m-pad mx-auto text-center text-[40px] font-extrabold">
        Honoring Global Leaders Making a Difference
      </h1>
      <div className="grid grid-cols-1 grid-rows-1">
        <div className="z-20 col-start-1 row-start-1 flex flex-col gap-10">
          {WCAGlobalLeadersData.map((data, idx) => (
            <div key={data.color} className="m-pad content-w">
              <ImgShowcase
                text={data.text}
                color={data.color}
                img={data.img}
                textLeft={idx % 2 === 0}
              />
            </div>
          ))}
        </div>
        <div className="m-pad z-0 col-start-1 row-start-1 mt-20 flex min-w-[1100px] items-center md:-mt-8 lg:mt-20">
          <img src={ribbonBackground} className="" />
        </div>
        <div className="m-pad z-10 col-start-1 row-start-1 my-auto md:hidden lg:block">
          <img src={ribbonFlair} className="my-auto" />
        </div>
      </div>
      <p className="content-w m-pad mx-auto">
        The 4th World Children’s Award will be presented by young people to the
        leader they select at the{' '}
        <a className={linkClasses} href="https://worldchildrensfestival.org">
          7th World Children’s Festival
        </a>{' '}
        on the National Mall from July 25 to 27, 2026.
      </p>
    </div>
  );
};
