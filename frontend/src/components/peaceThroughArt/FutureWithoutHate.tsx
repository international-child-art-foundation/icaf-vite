import bannerBackground from '@/assets/peaceThroughArt/bannerBackground.svg';
import threeLines from '@/assets/peaceThroughArt/threeLines.svg';
import { PTACard } from './PTACard';
import { PTACardData } from '@/data/peaceThroughArt/PeaceThroughArtData';

export const FutureWithoutHate = () => {
  return (
    <div className="site-w h-full">
      <div className="grid grid-cols-1 grid-rows-1 justify-center">
        <div className="col-start-1 row-start-1 mx-auto">
          <img src={bannerBackground} className="breakout-w object-cover" />
        </div>
        <div className="col-start-1 row-start-1 mt-48 flex select-none justify-center md:mt-80">
          <img src={threeLines} className="object-cover" alt=""></img>
        </div>
        <div className="m-pad content-w col-start-1 row-start-1 flex h-full w-full flex-col justify-center gap-6 text-center">
          <h2 className="font-montserrat text-[40px] font-extrabold">
            A Future Without Hate
          </h2>
          <p className="">
            ICAF's <span className="font-bold"> Peace Through Art </span>
            programs are designed to:
          </p>
          <div className="breakout-w mx-auto grid min-h-[220px] gap-4 sm:min-h-[300px] sm:grid-cols-3">
            {PTACardData.map((data) => (
              <PTACard key={data.title} {...data} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
