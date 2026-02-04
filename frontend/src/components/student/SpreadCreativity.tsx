import blueBackground from '@/assets/student/blueBackground.svg';
import blueBackgroundSmall from '@/assets/student/blueBackgroundSmall.svg';
import { useWindowSize } from 'usehooks-ts';
import {
  CardContentXl,
  CardContentMdLg,
  CardContentSm,
} from './SpreadCreativityComponents';

export const SpreadCreativity = () => {
  const size = useWindowSize();
  return (
    <div className="my-12 flex flex-col gap-32">
      <div className="max-w-screen-3xl grid grid-cols-1 grid-rows-1 pr-4">
        <div className="col-start-1 row-start-1">
          {size.width > 768 ? (
            <img src={blueBackground} className="xl:-mt-4 xl:ml-8" />
          ) : (
            <img src={blueBackgroundSmall} className="-ml-2 mt-4" />
          )}
        </div>
        {size.width > 1280 && <CardContentXl />}
        {size.width <= 1280 && size.width > 768 && <CardContentMdLg />}
        {size.width <= 768 && <CardContentSm />}
      </div>
      <div className="mx-auto flex max-w-[80%] flex-col gap-8">
        <h2 className="font-montserrat text-center text-[40px] font-extrabold leading-[48px]">
          Ready to Get Creative?
        </h2>
        <p className="max-w-[800px] text-xl">
          Join us and start your journey with ICAF. Whether you're drawing,
          painting, building, or imagining, your creativity has the power to
          change the world!
        </p>
      </div>
    </div>
  );
};
