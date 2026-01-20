import worldMural from '@/assets/leadership/WorldMural.webp';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

export const ImpactCallout = () => {
  return (
    <div className="h-[700px] overflow-hidden rounded-[40px] bg-[#FFECCB] lg:h-[300px] xl:h-[unset]">
      <div className="grid h-full grid-cols-1 grid-rows-2 lg:grid-cols-2 lg:grid-rows-1">
        <div className="mx-auto my-auto flex flex-col gap-6 p-8">
          <div className="text-center md:text-start">
            <h4 className="font-montserrat text-2xl font-extrabold">
              Investing In Childhood Worldwide
            </h4>
            <p className="text-2xl">Since 1997.</p>
          </div>
          <Link to="/impact" className="flex md:mr-auto">
            <Button className="md:mx-unset mx-auto rounded-full px-6 py-6 text-[19px]">
              View our impact
            </Button>
          </Link>
        </div>
        <div className="">
          <img
            className="ml-auto mr-0 mt-auto min-h-full min-w-full object-cover lg:h-full lg:w-[unset]"
            src={worldMural}
          />
        </div>
      </div>
    </div>
  );
};
