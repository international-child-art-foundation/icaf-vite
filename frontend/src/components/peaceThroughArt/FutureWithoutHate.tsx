import bannerBackground from '@/assets/peaceThroughArt/bannerBackground.svg';
import threeLines from '@/assets/peaceThroughArt/threeLines.svg';
import { PTACard } from './PTACard';
import { PTACardData } from '@/data/peaceThroughArt/PeaceThroughArtData';

export const FutureWithoutHate = () => {
  return (
    <div className="mt-20 h-full w-full">
      <div className="grid grid-cols-1 grid-rows-1 justify-center">
        <div className="col-start-1 row-start-1">
          <img
            src={bannerBackground}
            className="h-[1100px] object-cover sm:h-[895px]"
          />
        </div>
        <div className="col-start-1 row-start-1 mt-48 flex select-none justify-center md:mt-80">
          <img src={threeLines} className="object-cover"></img>
        </div>
        <div className="col-start-1 row-start-1 flex h-full w-full flex-col justify-center gap-6 text-center">
          <p className="font-montserrat text-[40px] font-extrabold">
            A Future Without Hate
          </p>
          <p className="">
            ICAF’s <span className="font-bold"> Peace Through Art </span>
            programs are designed to:
          </p>
          <div className="mx-auto grid min-h-[220px] max-w-[1200px] gap-4 px-10 sm:min-h-[300px] sm:grid-cols-3">
            {PTACardData.map((data) => (
              <PTACard key={data.title} {...data} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
