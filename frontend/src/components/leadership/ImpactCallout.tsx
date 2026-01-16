import worldMural from '@/assets/leadership/WorldMural.webp';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

export const ImpactCallout = () => {
  return (
    <div className="h-[700px] overflow-hidden rounded-[40px] bg-[#FFECCB] md:h-[300px] lg:h-[unset]">
      <div className="grid h-full grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
        <div className="mx-auto my-auto flex flex-col">
          <h4 className="font-montserrat text-2xl font-extrabold">
            Investing In Childhood Worldwide
          </h4>
          <p className="text-2xl">Since 1997.</p>
          <Link to="/impact">
            <Button className="rounded-full px-6 text-[19px]">
              View our impact
            </Button>
          </Link>
        </div>
        <img
          className="w-full object-cover md:h-full md:w-[unset]"
          src={worldMural}
        />
      </div>
    </div>
  );
};
