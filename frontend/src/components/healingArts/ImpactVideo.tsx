import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { VideoWrapper } from '../shared/VideoWrapper';
import healingArtsImg from '@/assets/shared/images/navigation/programs/healingArtsProgram_smaller.webp';
import { useWindowSize } from 'usehooks-ts';
import healingArtsVideo from '@/assets/healingArts/healing-arts.mp4';
import healingArtsThumb from '@/assets/healingArts/healing-arts-thumb.webp';

export const ImpactVideo = () => {
  const size = useWindowSize();
  return size.width >= 1536 || size.width <= 700 ? (
    <ImpactVideoThreeRows />
  ) : (
    <ImpactVideoTwoRows />
  );
};

export const ImpactVideoThreeRows = () => {
  return (
    <div>
      <div className="relative flex w-full flex-col gap-8 overflow-hidden rounded-xl 2xl:flex-row">
        <div className="relative h-full w-full overflow-hidden rounded-xl 2xl:basis-[70%]">
          <VideoWrapper src={healingArtsVideo} thumbnail={healingArtsThumb} />
        </div>
        <div className="flex h-auto w-full flex-col justify-between gap-4 overflow-hidden rounded-[20px] bg-[#DFE7F8] p-8 2xl:basis-[30%]">
          <div className="relative flex flex-col gap-10">
            <div className="flex w-full flex-col gap-2">
              <h2 className="font-montserrat text-2xl font-bold">
                View our impact
              </h2>
              <p>See how children cope and recover from pain.</p>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl">
            <img
              src={healingArtsImg}
              className="mx-auto rounded-[16px] object-contain"
            />
          </div>
          <Button size="lg" className="mx-auto self-start rounded-full px-12">
            <Link to="/gallery" className="font-sans text-lg">
              View art gallery
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ImpactVideoTwoRows = () => {
  return (
    <div>
      <div className="relative flex flex-col gap-8 overflow-hidden rounded-xl 2xl:flex-row">
        <div className="relative h-full w-full overflow-hidden rounded-xl">
          <VideoWrapper src={healingArtsVideo} thumbnail={healingArtsThumb} />
        </div>
        <div className="flex h-[250px] w-full flex-row justify-between gap-4 overflow-hidden rounded-[20px] bg-[#DFE7F8] p-8 2xl:h-auto 2xl:w-[400px] 2xl:flex-col 2xl:gap-4">
          <div className="relative flex flex-col gap-10">
            <div className="flex w-full flex-col gap-2">
              <p className="font-montserrat text-2xl font-bold">
                View our impact
              </p>
              <p className="">See how children cope and recover from pain.</p>
            </div>
            <Button size="lg" className="self-start rounded-full px-12">
              <Link to="/gallery" className="font-sans lg:text-xl">
                View art gallery
              </Link>
            </Button>
          </div>
          <div className="relative ml-auto mr-0 overflow-hidden rounded-xl">
            <img
              src={healingArtsImg}
              className="ml-auto mr-0 max-h-full rounded-[16px] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
