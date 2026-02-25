import ribbonBackground from '@/assets/worldChildrensAward/ribbon-background.svg';
import ribbonFlair from '@/assets/worldChildrensAward/ribbon-flair.svg';
import { WCAGlobalLeadersData } from '@/data/worldChildrensAward/WCAData';
import { ImgShowcase } from './ImgShowcase';

export const WCAGlobalLeaders = () => {
  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-montserrat mx-auto text-center text-[40px] font-extrabold">
        Honoring Global Leaders Making a Difference
      </h1>
      <div className="grid grid-cols-1 grid-rows-1">
        <div className="z-20 col-start-1 row-start-1">
          {WCAGlobalLeadersData.map((data, idx) => (
            <div key={data.color} className="m-pad flex flex-col gap-10">
              <ImgShowcase
                text={data.text}
                color={data.color}
                img={data.img}
                textLeft={idx % 2 === 0}
              />
            </div>
          ))}
        </div>
        <div className="z-0 col-start-1 row-start-1">
          <img src={ribbonBackground} className="" />
        </div>
        <div className="z-10 col-start-1 row-start-1 my-auto">
          <img src={ribbonFlair} className="my-auto" />
        </div>
      </div>
    </div>
  );
};
